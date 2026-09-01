import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import capsuleService from '../services/capsuleService';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import GeoLockPicker from '../components/GeoLockPicker';
import ChainPicker from '../components/ChainPicker';
import EncryptionToggle from '../components/EncryptionToggle';
import { encryptContent } from '../utils/encryption';
import RecipientInput from '../components/RecipientInput';
import LegacyToggle from '../components/LegacyToggle';
import VoiceRecorder from '../components/VoiceRecorder';
import VideoRecorder from '../components/VideoRecorder';


function CreateCapsule() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);       // Actual File objects
  const [previews, setPreviews] = useState([]);   // Preview URLs for display
  const [prerequisiteId, setPrerequisiteId] = useState(null);
  const [recipients, setRecipients] = useState([]);

  const [geoData, setGeoData] = useState({
    isGeoLocked: false,
    latitude: '',
    longitude: '',
    geoRadius: 100,
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    unlockAt: '',
    isPublic: false,
  });

  const [encryptionData, setEncryptionData] = useState({
    isEncrypted: false,
    passphrase: '',
  });

  const [legacyData, setLegacyData] = useState({
    isLegacy: false,
    legacyDays: 180,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files);

    if (files.length + selectedFiles.length > 5) {
      toast.error('Maximum 5 files per capsule');
      return;
    }

    // Validate file sizes
    for (const file of selectedFiles) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 10MB limit`);
        return;
      }
    }

    // Create preview URLs for images
    const newPreviews = selectedFiles.map((file) => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

    setFiles((prev) => [...prev, ...selectedFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    // Reset the file input so the same file can be selected again
    e.target.value = '';
  }

  function removeFile(index) {
    // Revoke the preview URL to free memory
    if (previews[index].url) {
      URL.revokeObjectURL(previews[index].url);
    }
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // function getMinDate() {
  //   const tomorrow = new Date();
  //   tomorrow.setDate(tomorrow.getDate() + 1);
  //   return tomorrow.toISOString().slice(0, 16);
  // }
    function getMinDate() {
    const fiveMinFromNow = new Date();
    fiveMinFromNow.setMinutes(fiveMinFromNow.getMinutes() + 5);
    return fiveMinFromNow.toISOString().slice(0, 16);
  }

  // Get icon based on file type
  function getFileIcon(mimetype) {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.startsWith('video/')) return '🎬';
    if (mimetype === 'application/pdf') return '📄';
    return '📎';
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.unlockAt) {
      toast.error('Unlock date is required');
      return;
    }

    setIsLoading(true);

    try {
      const unlockDate = new Date(formData.unlockAt).toISOString();

      let contentToSend = formData.content;
      let encryptionMeta = {};

      if (encryptionData.isEncrypted && encryptionData.passphrase) {
        const encrypted = await encryptContent(formData.content, encryptionData.passphrase);
        contentToSend = JSON.stringify(encrypted);
        encryptionMeta = { isEncrypted: true };
      }

      await capsuleService.createCapsule(
        {
          title: formData.title,
          content: contentToSend,
          unlockAt: unlockDate,
          isPublic: formData.isPublic,
          ...geoData,
          prerequisiteId,
          ...encryptionMeta,
          isAnonymous: formData.isAnonymous,
          selfDestructAfterRead: formData.selfDestructAfterRead,
          recipients: JSON.stringify(recipients),
          ...legacyData,
        },
        files
      );

      
      // await capsuleService.createCapsule(
      //   {
      //     title: formData.title,
      //     content: formData.content,
      //     unlockAt: unlockDate,
      //     isPublic: formData.isPublic,
      //     ...geoData,
      //     prerequisiteId,
      //   },
      //   files
      // );

      toast.success('Time capsule created and sealed! 🔒');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create capsule';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      <div className="container page">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              🕰️ Create a Time Capsule
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Write a message, attach memories, pick a future date, and seal it away.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="What's this capsule about?"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                name="content"
                className="form-input"
                placeholder="Write a message to your future self, a friend, or the world..."
                value={formData.content}
                onChange={handleChange}
                rows={5}
                maxLength={10000}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.3rem' }}>
                {formData.content.length} / 10,000
              </p>
            </div>
            <div className="form-group">
              <RecipientInput recipients={recipients} onChange={setRecipients} />
            </div>
            
            {/* File Upload Section */}
            <div className="form-group">
              <label className="form-label">Attachments (optional)</label>

              {/* Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,audio/*,video/*,.pdf"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={files.length >= 5}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  background: 'transparent',
                  border: '2px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: files.length >= 5 ? 'var(--text-muted)' : 'var(--accent-purple)',
                  cursor: files.length >= 5 ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  if (files.length < 5) e.target.style.borderColor = 'var(--accent-purple)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = 'var(--border-subtle)';
                }}
              >
                {files.length >= 5
                  ? 'Maximum 5 files reached'
                  : `📎 Click to add files (${files.length}/5)`}
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Images, audio, video, PDF — max 10MB each
              </p>

              {/* File Previews */}
              {previews.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '0.75rem',
                  marginTop: '1rem',
                }}>
                  {previews.map((preview, index) => (
                    <div key={index} style={{
                      position: 'relative',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                    }}>
                      {/* Image preview or icon */}
                      {preview.url ? (
                        <img
                          src={preview.url}
                          alt={preview.name}
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div style={{
                          height: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                        }}>
                          {getFileIcon(preview.type)}
                        </div>
                      )}

                      {/* File info */}
                      <div style={{ padding: '0.5rem' }}>
                        <p style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {preview.name}
                        </p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {preview.size}
                        </p>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: 'rgba(248, 113, 113, 0.9)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <VoiceRecorder onRecorded={(file) => {
                if (file) setFiles((prev) => [...prev, file]);
                else setFiles((prev) => prev.filter((f) => !f.name.startsWith('voice-memo')));
              }} />
              <VideoRecorder onRecorded={(file) => {
                if (file) setFiles((prev) => [...prev, file]);
                else setFiles((prev) => prev.filter((f) => !f.name.startsWith('video-message')));
              }} />
            </div>
            <div className="form-group">
              <label className="form-label">Unlock Date & Time</label>
              <input
                type="datetime-local"
                name="unlockAt"
                className="form-input"
                value={formData.unlockAt}
                onChange={handleChange}
                min={getMinDate()}
                required
                style={{ colorScheme: 'dark' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                The capsule will be sealed until this date. Nobody can read it before then.
              </p>
            </div>
            <div className="form-group">
              <GeoLockPicker geoData={geoData} onChange={setGeoData} />
            </div>
            <div className="form-group">
              <ChainPicker selectedId={prerequisiteId} onChange={setPrerequisiteId} />
            </div>
            <div className="form-group">
              <EncryptionToggle encryptionData={encryptionData} onChange={setEncryptionData} />
            </div>
            <div className="form-group">
              <LegacyToggle 
                legacyData={legacyData} 
                onChange={setLegacyData}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" name="isAnonymous" checked={formData.isAnonymous || false}
                  onChange={(e) => setFormData(p => ({ ...p, isAnonymous: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-purple)' }} />
                🎭 Send anonymously (hide your name from the recipient)
              </label>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" name="selfDestructAfterRead" checked={formData.selfDestructAfterRead || false}
                  onChange={(e) => setFormData(p => ({ ...p, selfDestructAfterRead: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-red)' }} />
                💨 Self-destruct after reading (message disappears once opened)
              </label>
            </div>
            <div className="form-group">
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
              }}>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-purple)' }}
                />
                Make this capsule public (visible on the public wall after it opens)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{ flex: 2 }}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                    Sealing...
                  </>
                ) : (
                  '🔒 Seal Capsule'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCapsule;
