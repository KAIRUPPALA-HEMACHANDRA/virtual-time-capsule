import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import capsuleService from '../services/capsuleService';
import CapsuleCard from '../components/CapsuleCard';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

function Dashboard() {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchCapsules();
  }, []);

  async function fetchCapsules() {
    try {
      const response = await capsuleService.getMyCapsules();
      setCapsules(response.data.capsules);
    } catch {
      toast.error('Failed to load capsules');
    } finally {
      setLoading(false);
    }
  }

  const filteredCapsules = filter === 'ALL'
    ? capsules
    : capsules.filter((c) => c.status === filter);

  const counts = {
    ALL: capsules.length,
    LOCKED: capsules.filter((c) => c.status === 'LOCKED').length,
    UNLOCKED: capsules.filter((c) => c.status === 'UNLOCKED').length,
    OPENED: capsules.filter((c) => c.status === 'OPENED').length,
  };

  const filters = [
    { key: 'ALL', label: 'All' },
    { key: 'LOCKED', label: '🔒 Locked' },
    { key: 'UNLOCKED', label: '🔓 Unlocked' },
    { key: 'OPENED', label: '📖 Opened' },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      <div className="container page">
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 700, marginBottom: '0.25rem' }}>
              My Capsules
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {capsules.length === 0
                ? 'No capsules yet — create your first one!'
                : `${capsules.length} capsule${capsules.length !== 1 ? 's' : ''} total`}
            </p>
          </div>

          <Link to="/capsule/new" className="btn btn-primary">
            + New Capsule
          </Link>
        </div>

        {/* Filters */}
        {capsules.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}>
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: filter === f.key ? 'var(--accent-purple)' : 'var(--border-subtle)',
                  background: filter === f.key ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                  color: filter === f.key ? 'var(--accent-purple)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {f.label} ({counts[f.key]})
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : filteredCapsules.length === 0 ? (
          <div className="empty-state">
            {capsules.length === 0 ? (
              <>
                <h3>🕰️ Your time capsule collection is empty</h3>
                <p>Create your first capsule and seal a message for the future.</p>
                <Link to="/capsule/new" className="btn btn-primary">Create Your First Capsule</Link>
              </>
            ) : (
              <>
                <h3>No {filter.toLowerCase()} capsules</h3>
                <p>No capsules match this filter.</p>
              </>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
          }}>
            {filteredCapsules.map((capsule) => (
              <CapsuleCard key={capsule.id} capsule={capsule} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
