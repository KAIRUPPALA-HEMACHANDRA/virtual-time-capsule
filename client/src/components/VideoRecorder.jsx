import { useState, useRef } from 'react';

/**
 * VideoRecorder
 * 
 * Records video using the device camera directly in the browser.
 * Shows a live camera preview while recording.
 * The recorded video is returned as a File object for upload.
 */

function VideoRecorder({ onRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [duration, setDuration] = useState(0);
  const videoPreviewRef = useRef(null);
  const videoPlaybackRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });

      streamRef.current = stream;
      setShowCamera(true);

      // Show live preview
      setTimeout(() => {
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      alert('Could not access camera. Please allow camera and microphone permissions.');
    }
  }

  function startRecording() {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4',
    });

    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);

      const ext = mediaRecorder.mimeType.includes('webm') ? 'webm' : 'mp4';
      const file = new File([blob], `video-message-${Date.now()}.${ext}`, {
        type: mediaRecorder.mimeType,
      });

      onRecorded(file);
    };

    mediaRecorder.start(100);
    setIsRecording(true);
    setVideoURL(null);
    setDuration(0);

    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      closeCamera();
    }
  }

  function closeCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  }

  function removeRecording() {
    if (videoURL) URL.revokeObjectURL(videoURL);
    setVideoURL(null);
    setDuration(0);
    onRecorded(null);
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  return (
    <div style={{
      background: 'rgba(96, 165, 250, 0.04)',
      border: '1px solid rgba(96, 165, 250, 0.12)',
      borderRadius: 'var(--radius-sm)',
      padding: '1rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: showCamera || videoURL ? '0.75rem' : 0,
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          🎬 Video Message
        </span>

        {!showCamera && !videoURL && (
          <button
            type="button"
            onClick={openCamera}
            style={{
              padding: '0.4rem 1rem',
              background: 'rgba(96, 165, 250, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            📷 Open Camera
          </button>
        )}
      </div>

      {/* Live Camera Preview */}
      {showCamera && (
        <div style={{ position: 'relative' }}>
          <video
            ref={videoPreviewRef}
            autoPlay
            muted
            playsInline
            style={{
              width: '100%',
              maxHeight: '250px',
              borderRadius: 'var(--radius-sm)',
              background: '#000',
              transform: 'scaleX(-1)',
            }}
          />

          {/* Recording indicator */}
          {isRecording && (
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.6rem',
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '12px',
              fontSize: '0.8rem',
              color: '#f87171',
            }}>
              ⏺ REC {formatTime(duration)}
            </div>
          )}

          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '0.75rem',
          }}>
            {!isRecording ? (
              <>
                <button
                  type="button"
                  onClick={startRecording}
                  style={{
                    padding: '0.5rem 1.25rem',
                    background: 'rgba(248, 113, 113, 0.2)',
                    color: '#f87171',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  ⏺ Record
                </button>
                <button
                  type="button"
                  onClick={closeCamera}
                  style={{
                    padding: '0.5rem 1.25rem',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕ Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: 'rgba(74, 222, 128, 0.2)',
                  color: '#4ade80',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                ⏹ Stop Recording
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recorded Video Playback */}
      {videoURL && (
        <div>
          <video
            ref={videoPlaybackRef}
            controls
            src={videoURL}
            style={{
              width: '100%',
              maxHeight: '250px',
              borderRadius: 'var(--radius-sm)',
              background: '#000',
            }}
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.5rem',
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Duration: {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={removeRecording}
              style={{
                padding: '0.3rem 0.75rem',
                background: 'rgba(248, 113, 113, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              ✕ Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoRecorder;
