import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import capsuleService from '../services/capsuleService';
import CapsuleCard from '../components/CapsuleCard';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

function Dashboard() {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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

  // Filter, search, and sort — all computed from the same data
  const displayedCapsules = useMemo(() => {
    let result = [...capsules];

    // Status filter
    if (filter !== 'ALL') {
      result = result.filter((c) => c.status === filter);
    }

    // Search by title
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.title.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'unlocks-soon':
        result.sort((a, b) => new Date(a.unlockAt) - new Date(b.unlockAt));
        break;
      case 'unlocks-later':
        result.sort((a, b) => new Date(b.unlockAt) - new Date(a.unlockAt));
        break;
      case 'title-az':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return result;
  }, [capsules, filter, searchQuery, sortBy]);

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
          <Link to="/capsule/new" className="btn btn-primary">+ New Capsule</Link>
        </div>

        {/* Search + Sort Bar */}
        {capsules.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
          }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search capsules by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.6rem 1rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
                colorScheme: 'dark',
                minWidth: '160px',
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="unlocks-soon">Unlocks soonest</option>
              <option value="unlocks-later">Unlocks latest</option>
              <option value="title-az">Title A–Z</option>
            </select>
          </div>
        )}

        {/* Filter Tabs */}
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
        ) : displayedCapsules.length === 0 ? (
          <div className="empty-state">
            {capsules.length === 0 ? (
              <>
                <h3>🕰️ Your time capsule collection is empty</h3>
                <p>Create your first capsule and seal a message for the future.</p>
                <Link to="/capsule/new" className="btn btn-primary">Create Your First Capsule</Link>
              </>
            ) : searchQuery ? (
              <>
                <h3>No results for "{searchQuery}"</h3>
                <p>Try a different search term.</p>
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
            {displayedCapsules.map((capsule) => (
              <CapsuleCard key={capsule.id} capsule={capsule} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
