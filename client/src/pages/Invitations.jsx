import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();
  }, []);

  async function fetchInvitations() {
    try {
      const { data } = await api.get('/collaborate/invitations');
      setInvitations(data.data.invitations);
    } catch {
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(capsuleId) {
    try {
      await api.post(`/collaborate/${capsuleId}/accept`);
      toast.success('Invitation accepted! You can now contribute.');
      navigate(`/capsule/${capsuleId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept');
    }
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="container page">
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            📬 Invitations
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Capsules you've been invited to contribute to.
          </p>

          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : invitations.length === 0 ? (
            <div className="empty-state">
              <h3>No pending invitations</h3>
              <p>When someone invites you to a collaborative capsule, it will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {invitations.map((inv) => (
                <div key={inv.id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {inv.capsule.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      From {inv.capsule.creator.name} · Opens {new Date(inv.capsule.unlockAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAccept(inv.capsuleId)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', whiteSpace: 'nowrap' }}
                  >
                    ✅ Accept
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Invitations;
