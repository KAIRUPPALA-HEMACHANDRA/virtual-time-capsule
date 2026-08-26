import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const moodEmojis = {
  happy: '😊', hopeful: '🌤️', neutral: '😐', melancholic: '🥀', sad: '😢',
};

function PublicWall() {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicCapsules();
  }, []);

  async function fetchPublicCapsules() {
    try {
      const { data } = await api.get('/public/capsules');
      setCapsules(data.data.capsules);
    } catch {
      // Fail silently
    } finally {
      setLoading(false);
    }
  }

  function getTimeSince(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <Link to="/" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#e8e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🕰️</span>
          <span className="text-gradient">Time Capsule</span>
        </Link>
        <Link to="/login" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
          Log In
        </Link>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            🌍 <span className="text-gradient">Public Capsule Wall</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Messages from the past, opened for the world to read.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : capsules.length === 0 ? (
          <div className="empty-state">
            <h3>No public capsules yet</h3>
            <p>When users open capsules marked as public, they'll appear here.</p>
            <Link to="/register" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Create Your Own
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {capsules.map((capsule) => (
              <div key={capsule.id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                transition: 'all 0.2s',
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                  gap: '1rem',
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, flex: 1 }}>
                    {capsule.title}
                  </h3>
                  {capsule.sentimentLabel && (
                    <span style={{ fontSize: '1.2rem' }}>
                      {moodEmojis[capsule.sentimentLabel] || '😐'}
                    </span>
                  )}
                </div>

                {/* Content */}
                {capsule.content && (
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    marginBottom: '1rem',
                  }}>
                    {capsule.content.length > 500
                      ? capsule.content.substring(0, 500) + '...'
                      : capsule.content}
                  </p>
                )}

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}>
                  <span>by {capsule.creator.name}</span>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span>Sealed: {new Date(capsule.createdAt).toLocaleDateString()}</span>
                    <span>Opened: {getTimeSince(capsule.openedAt || capsule.unlockAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicWall;
