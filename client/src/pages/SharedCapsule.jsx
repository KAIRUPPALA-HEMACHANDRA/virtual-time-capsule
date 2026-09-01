import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Countdown from '../components/Countdown';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * SharedCapsule Page
 * 
 * PUBLIC — no login required.
 * Anyone with the share link sees this page.
 * Shows a beautiful reveal when the capsule is open,
 * or a countdown if still locked.
 */

const reactionEmojis = ['❤️', '😍', '😂', '😢', '🥺', '🤯', '🔥', '👏'];

function SharedCapsule() {
  const { token } = useParams();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reacted, setReacted] = useState(false);

  useEffect(() => {
    fetchCapsule();
  }, [token]);

  async function fetchCapsule() {
    try {
      const { data } = await api.get(`/shared/${token}`);
      setCapsule(data.data.capsule);
    } catch (err) {
      setError(err.response?.data?.message || 'This link is invalid or has expired');
    } finally {
      setLoading(false);
    }
  }

  async function handleReaction(emoji) {
    if (reacted) return;

    try {
      await api.post(`/shared/${token}/react`, { emoji });
      setReacted(true);
      toast.success(`${emoji} Reaction sent!`);
    } catch {
      toast.error('Failed to send reaction');
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--gradient-main)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💨</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{error}</h2>
        <p style={{ color: 'var(--text-muted)' }}>This capsule may have self-destructed or the link is invalid.</p>
      </div>
    );
  }

  if (!capsule) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-main)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            {capsule.isLocked ? '🔒' : '🕰️'}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            <span className="text-gradient">
              {capsule.isLocked ? 'A Capsule Awaits...' : 'A Message From The Past'}
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {capsule.isAnonymous ? 'From someone special 🎭' : `From ${capsule.creatorName}`}
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'rgba(17, 17, 40, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {capsule.isLocked ? (
            /* LOCKED VIEW — countdown */
            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                {capsule.title}
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                This capsule hasn't opened yet. Come back when the time arrives.
              </p>
              <Countdown targetDate={capsule.unlockAt} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
                Created on {new Date(capsule.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          ) : (
            /* UNLOCKED VIEW — full content */
            <>
              {/* Self-destruct warning */}
              {capsule.selfDestructAfterRead && (
                <div style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(248, 113, 113, 0.1)',
                  borderBottom: '1px solid rgba(248, 113, 113, 0.2)',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: 'var(--accent-red)',
                }}>
                  💨 This capsule will self-destruct after you leave this page
                </div>
              )}

              <div style={{ padding: '2rem' }}>
                {/* Title */}
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {capsule.title}
                </h2>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                  {capsule.isAnonymous ? '🎭 Anonymous' : `By ${capsule.creatorName}`} · {new Date(capsule.createdAt).toLocaleDateString()}
                  {capsule.sentimentLabel && ` · ${capsule.sentimentLabel === 'happy' ? '😊' : capsule.sentimentLabel === 'sad' ? '😢' : capsule.sentimentLabel === 'hopeful' ? '🌤️' : '😐'}`}
                </p>

                {/* Content */}
                {capsule.content && !capsule.isEncrypted && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1.5rem',
                  }}>
                    <p style={{
                      color: 'var(--text-primary)',
                      fontSize: '1.05rem',
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {capsule.content}
                    </p>
                  </div>
                )}

                {capsule.isEncrypted && (
                  <div style={{
                    textAlign: 'center', padding: '2rem',
                    background: 'rgba(74, 222, 128, 0.05)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(74, 222, 128, 0.15)',
                    marginBottom: '1.5rem',
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔐</div>
                    <p style={{ color: 'var(--text-muted)' }}>
                      This capsule is encrypted. Ask the sender for the passphrase.
                    </p>
                  </div>
                )}

                {/* Attachments */}
                {capsule.attachments?.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      📎 Attachments
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '0.5rem',
                    }}>
                      {capsule.attachments.map((a) => (
                        <div key={a.id} style={{
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-subtle)',
                        }}>
                          {a.mimetype.startsWith('image/') ? (
                            <a href={a.path} target="_blank" rel="noopener noreferrer">
                              <img src={a.path} alt={a.originalName}
                                style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                            </a>
                          ) : a.mimetype.startsWith('audio/') ? (
                            <div style={{ padding: '0.75rem' }}>
                              <audio controls src={a.path} style={{ width: '100%' }} />
                            </div>
                          ) : a.mimetype.startsWith('video/') ? (
                            <video controls src={a.path} style={{ width: '100%' }} />
                          ) : (
                            <a href={a.path} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'block', padding: '1rem', color: 'var(--accent-purple)', fontSize: '0.85rem' }}>
                              📄 {a.originalName}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contributions */}
                {capsule.contributions?.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      👥 Contributions
                    </h3>
                    {capsule.contributions.map((c, i) => (
                      <div key={i} style={{
                        padding: '1rem',
                        background: 'rgba(167, 139, 250, 0.05)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(167, 139, 250, 0.1)',
                        marginBottom: '0.5rem',
                      }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', marginBottom: '0.25rem' }}>
                          {c.name}
                        </p>
                        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {c.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Emoji Reactions */}
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '1.25rem',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {reacted ? 'Thanks for your reaction! 💜' : 'React to this capsule:'}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}>
                    {reactionEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        disabled={reacted}
                        style={{
                          fontSize: '1.5rem',
                          padding: '0.5rem',
                          background: reacted ? 'transparent' : 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          cursor: reacted ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          opacity: reacted ? 0.5 : 1,
                        }}
                        onMouseOver={(e) => { if (!reacted) e.target.style.transform = 'scale(1.2)'; }}
                        onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          🕰️ Virtual Time Capsule — Preserve today. Unlock tomorrow.
        </p>
      </div>
    </div>
  );
}

export default SharedCapsule;
