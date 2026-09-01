import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import capsuleService from '../services/capsuleService';
import Countdown from '../components/Countdown';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import GeoUnlock from '../components/GeoUnlock';
import ChainStatus from '../components/ChainStatus';
import DecryptModal from '../components/DecryptModal';
import CollaboratorSection from '../components/CollaboratorSection';


function ViewCapsule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState(null);

  useEffect(() => {
    fetchCapsule();
  }, [id]);

  async function fetchCapsule() {
    try {
      const response = await capsuleService.getCapsule(id);
      setCapsule(response.data.capsule);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Capsule not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this capsule? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await capsuleService.deleteCapsule(id);
      toast.success('Capsule deleted');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
      setDeleting(false);
    }
  }

  function getFileIcon(mimetype) {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.startsWith('video/')) return '🎬';
    if (mimetype === 'application/pdf') return '📄';
    return '📎';
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Navbar />
        <div className="loading-page"><div className="spinner" /></div>
      </div>
    );
  }

  if (!capsule) return null;

  const isLocked = capsule.status === 'LOCKED';
  const hasAttachments = capsule.attachments && capsule.attachments.length > 0;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      <div className="container page">
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          <button onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1.5rem', padding: 0 }}>
            ← Back to Dashboard
          </button>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            {/* Status Banner */}
            <div style={{
              padding: '1rem 2rem',
              background: isLocked ? 'rgba(251, 191, 36, 0.08)' : 'rgba(74, 222, 128, 0.08)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: isLocked ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
                {isLocked ? '🔒 This capsule is sealed' : capsule.status === 'UNLOCKED' ? '🔓 Ready to read!' : '📖 Opened'}
              </span>
              {isLocked && <Countdown targetDate={capsule.unlockAt} />}
            </div>

            <div style={{ padding: '2rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.3 }}>
                {capsule.title}
              </h1>

              {/* Content */}
              {isLocked ? (
                <>
                  <div style={{
                    textAlign: 'center', padding: '3rem 2rem',
                    background: 'rgba(167, 139, 250, 0.05)', borderRadius: 'var(--radius-md)',
                    border: '1px dashed rgba(167, 139, 250, 0.2)',
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                    <h3 style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Content Sealed</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      This capsule's content is hidden until{' '}
                      <strong style={{ color: 'var(--text-secondary)' }}>
                        {new Date(capsule.unlockAt).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </strong>
                    </p>
                    {hasAttachments && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                        📎 {capsule.attachments.length} attachment{capsule.attachments.length !== 1 ? 's' : ''} sealed inside
                      </p>
                    )}
                  </div>
                  {capsule.isGeoLocked && (
                    <GeoUnlock capsuleId={capsule.id} onUnlock={() => fetchCapsule()} />
                  )}
                  {capsule.prerequisiteId && (
                    <ChainStatus capsule={capsule} />
                  )}
                </>
              ) : (
                <>
                  {capsule.content && (
                    capsule.isEncrypted && !decryptedContent ? (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <DecryptModal
                          encryptedData={JSON.parse(capsule.content).encryptedData}
                          salt={JSON.parse(capsule.content).salt}
                          iv={JSON.parse(capsule.content).iv}
                          onDecrypted={setDecryptedContent}
                        />
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)',
                        padding: '1.5rem', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem',
                      }}>
                        {capsule.isEncrypted && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginBottom: '0.75rem' }}>
                            🔐 End-to-end encrypted — decrypted in your browser
                          </p>
                        )}
                        <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                          {decryptedContent || capsule.content}
                        </p>
                      </div>
                    )
                  )}
                
                  {/* {capsule.content && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)',
                      padding: '1.5rem', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem',
                    }}>
                      <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                        {capsule.content}
                      </p>
                    </div>
                  )} */}

                  {hasAttachments && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        📎 Attachments ({capsule.attachments.length})
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                        {capsule.attachments.map((attachment) => (
                          <div key={attachment.id} style={{
                            background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                          }}>
                            {attachment.mimetype.startsWith('image/') ? (
                              <a href={attachment.path} target="_blank" rel="noopener noreferrer">
                                <img src={attachment.path} alt={attachment.originalName}
                                  style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                              </a>
                            ) : attachment.mimetype.startsWith('audio/') ? (
                              <div style={{ padding: '1rem' }}>
                                <div style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>🎵</div>
                                <audio controls style={{ width: '100%' }} src={attachment.path} />
                              </div>
                            ) : attachment.mimetype.startsWith('video/') ? (
                              <video controls style={{ width: '100%', maxHeight: '200px' }} src={attachment.path} />
                            ) : (
                              <a href={attachment.path} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', color: 'var(--accent-purple)', fontSize: '0.85rem' }}>
                                {getFileIcon(attachment.mimetype)} {attachment.originalName}
                              </a>
                            )}
                            <div style={{ padding: '0.4rem 0.6rem', borderTop: '1px solid var(--border-subtle)' }}>
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {attachment.originalName}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Metadata */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem',
                padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Created</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{new Date(capsule.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Unlocks</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{new Date(capsule.unlockAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Created by</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{capsule.creator?.name || 'You'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Visibility</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{capsule.isPublic ? '🌍 Public' : '🔐 Private'}</span>
                </div>
                {capsule.isLegacy && (
                  <>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Mode</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--accent-amber)' }}>🕊️ Legacy</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Triggers after</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{capsule.legacyDays} days inactive</span>
                    </div>
                  </>
                )}
              </div>
              {/* Recipients */}
              {capsule.recipients && capsule.recipients.length > 0 && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem 1.25rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                    📬 Recipients ({capsule.recipients.length})
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {capsule.recipients.map((r) => (
                      <span key={r.id} style={{
                        padding: '0.2rem 0.65rem',
                        background: 'rgba(96, 165, 250, 0.08)',
                        border: '1px solid rgba(96, 165, 250, 0.15)',
                        borderRadius: '14px',
                        fontSize: '0.8rem',
                        color: 'var(--accent-blue)',
                      }}>
                        {r.email} {r.notified ? '✅' : '⏳'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Proof of Creation */}
              <CollaboratorSection
                capsuleId={capsule.id}
                isCreator={capsule.creator?.id === capsule.creatorId}
                isLocked={isLocked}
              />
              {capsule.contentHash && (
                <Link to={`/verify/${capsule.id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  marginTop: '1rem', padding: '0.85rem',
                  background: 'rgba(74, 222, 128, 0.06)', border: '1px solid rgba(74, 222, 128, 0.15)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--accent-green)', fontSize: '0.9rem',
                  fontWeight: 500, transition: 'all 0.2s',
                }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(74, 222, 128, 0.12)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(74, 222, 128, 0.06)'}
                >
                  🛡️ View Proof-of-Creation Certificate
                </Link>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ flex: 1 }}>← Dashboard</button>
                {isLocked && (
                  <button onClick={() => navigate(`/capsule/${id}/edit`)} className="btn btn-secondary"
                    style={{ flex: 1, borderColor: 'rgba(167, 139, 250, 0.3)', color: 'var(--accent-purple)' }}>✏️ Edit</button>
                )}
                <button onClick={handleDelete} className="btn btn-danger" disabled={deleting} style={{ flex: 1 }}>
                  {deleting ? 'Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewCapsule;



