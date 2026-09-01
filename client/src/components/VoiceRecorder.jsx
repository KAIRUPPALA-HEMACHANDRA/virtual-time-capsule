import { useState, useRef } from 'react';

/**
 * VoiceRecorder
 * 
 * Records audio directly in the browser using the MediaRecorder API.
 * The recorded audio is returned as a File object that can be uploaded
 * alongside other capsule attachments.
 * 
 * HOW IT WORKS:
 * 1. User clicks "Start Recording"
 * 2. Browser asks for microphone permission
 * 3. MediaRecorder captures audio chunks
 * 4. When stopped, chunks are combined into a single audio file
 * 5. File is passed to the parent component for upload
 */

function VoiceRecorder({ onRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);

        // Convert to File object for upload
        const ext = mediaRecorder.mimeType.includes('webm') ? 'webm' : 'ogg';
        const file = new File([blob], `voice-memo-${Date.now()}.${ext}`, {
          type: mediaRecorder.mimeType,
        });

        onRecorded(file);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setAudioURL(null);
      setDuration(0);

      // Duration timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      alert('Could not access microphone. Please allow microphone permission.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);

      // Stop all audio tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  }

  function removeRecording() {
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
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
      background: 'rgba(167, 139, 250, 0.04)',
      border: '1px solid rgba(167, 139, 250, 0.12)',
      borderRadius: 'var(--radius-sm)',
      padding: '1rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          🎤 Voice Memo
        </span>

        {!audioURL && !isRecording && (
          <button
            type="button"
            onClick={startRecording}
            style={{
              padding: '0.4rem 1rem',
              background: 'rgba(248, 113, 113, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            ⏺ Start Recording
          </button>
        )}

        {isRecording && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: '#f87171',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#f87171',
                animation: 'spin 1s ease-in-out infinite',
              }} />
              {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={stopRecording}
              style={{
                padding: '0.4rem 1rem',
                background: 'rgba(74, 222, 128, 0.15)',
                color: '#4ade80',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                borderRadius: '20px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              ⏹ Stop
            </button>
          </div>
        )}
      </div>

      {audioURL && (
        <div style={{
          marginTop: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <audio controls src={audioURL} style={{ flex: 1, height: '36px' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {formatTime(duration)}
          </span>
          <button
            type="button"
            onClick={removeRecording}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-red)',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;
