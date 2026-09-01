import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * CollaboratorSection
 * 
 * Shown on the ViewCapsule page.
 * - Creator can invite contributors by email
 * - Shows list of contributors with their status
 * - When capsule is opened, shows all contributions
 */

function CollaboratorSection({ capsuleId, isCreator, isLocked }) {
  const [contributors, setContributors] = useState([]);
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [contributing, setContributing] = useState(false);
  const [myContent, setMyContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContributors();
  }, [capsuleId]);

  async function fetchContributors() {
    try {
      const { data } = await api.get(`/collaborate/${capsuleId}/contributors`);
      setContributors(data.data.contributors);
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setInviting(true);
    try {
      await api.post('/collaborate/invite', {
        capsuleId,
        emails: [email.trim().toLowerCase()],
      });
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      fetchContributors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite');
    } finally {
      setInviting(false);
    }
  }

  async function handleContribute(e) {
    e.preventDefault();
    if (!myContent.trim()) return;

    setContributing(true);
    try {
      await api.post(`/collaborate/${capsuleId}/contribute`, {
        content: myContent,
      });
      toast.success('Your contribution has been sealed! 🔒');
      setMyContent('');
      setShowForm(false);
      fetchContributors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to contribute');
    } finally {
      setContributing(false);
    }
  }

  const statusConfig = {
    pending: { label: '⏳ Pending', color: 'var(--accent-amber)' },
    accepted: { label: '✅ Joined', color: 'var(--accent-green)' },
    contributed: { label: '📝 Contributed', color: 'var(--accent-blue)' },
  };

  if (loading) return null;

  return (
    <div style={{
      background: 'rgba(96, 165, 250, 0.04)',
      border: '1px solid rgba(96, 165, 250, 0.12)',
      borderRadius: 'var(--radius-md)',
      padding: '1.5rem',
      marginTop: '1rem',
    }}>
      <h3 style={{
        fontSize: '1rem',
        fontWeight: 600,
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        👥 Collaborative Capsule
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
          ({contributors.length} contributor{contributors.length !== 1 ? 's' : ''})
        </span>
      </h3>

      {/* Invite Form (creator only, locked capsule only) */}
      {isCreator && isLocked && (
        <form onSubmit={handleInvite} style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}>
          <input
            type="email"
            className="form-input"
            placeholder="Invite by email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={inviting}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            {inviting ? '...' : '+ Invite'}
          </button>
        </form>
      )}

      {/* Contributors List */}
      {contributors.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {contributors.map((c) => (
            <div key={c.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  {c.name || c.email}
                </span>
                {c.name && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                    {c.email}
                  </span>
                )}
                {/* Show contribution content when capsule is opened */}
                {!isLocked && c.content && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(167, 139, 250, 0.05)',
                    borderRadius: '6px',
                    border: '1px solid rgba(167, 139, 250, 0.1)',
                  }}>
                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                    }}>
                      {c.content}
                    </p>
                  </div>
                )}
              </div>
              <span style={{
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '12px',
                color: statusConfig[c.status]?.color || 'var(--text-muted)',
                background: `${statusConfig[c.status]?.color || 'var(--text-muted)'}15`,
                whiteSpace: 'nowrap',
              }}>
                {statusConfig[c.status]?.label || c.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Contribute Form (non-creator contributors, locked capsule) */}
      {!isCreator && isLocked && (
        showForm ? (
          <form onSubmit={handleContribute}>
            <textarea
              className="form-input"
              placeholder="Write your contribution..."
              value={myContent}
              onChange={(e) => setMyContent(e.target.value)}
              rows={4}
              style={{ marginBottom: '0.75rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}
                style={{ flex: 1, fontSize: '0.85rem' }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={contributing}
                style={{ flex: 2, fontSize: '0.85rem' }}>
                {contributing ? 'Sealing...' : '🔒 Seal My Contribution'}
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowForm(true)} className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.85rem' }}>
            ✍️ Add My Contribution
          </button>
        )
      )}

      {isLocked && contributors.some((c) => c.status === 'contributed') && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
          Contributions are sealed and hidden until the capsule opens.
        </p>
      )}
    </div>
  );
}

export default CollaboratorSection;
