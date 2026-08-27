import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * ChainPicker
 * 
 * Lets users link this capsule to a previous one, creating a chain.
 * The new capsule won't be openable until the prerequisite is opened first.
 * This enables digital treasure hunts and sequential storytelling.
 */

function ChainPicker({ selectedId, onChange }) {
  const [enabled, setEnabled] = useState(false);
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (enabled && capsules.length === 0) {
      fetchCapsules();
    }
  }, [enabled]);

  async function fetchCapsules() {
    setLoading(true);
    try {
      const { data } = await api.get('/capsules');
      // Only show locked capsules as potential prerequisites
      setCapsules(data.data.capsules.filter((c) => c.status === 'LOCKED'));
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }

  function handleToggle(e) {
    setEnabled(e.target.checked);
    if (!e.target.checked) {
      onChange(null);
    }
  }

  return (
    <div style={{
      background: 'rgba(96, 165, 250, 0.04)',
      border: '1px solid rgba(96, 165, 250, 0.12)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem',
    }}>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        cursor: 'pointer',
        fontSize: '0.95rem',
        color: 'var(--text-secondary)',
        marginBottom: enabled ? '1rem' : 0,
      }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          style={{ width: '18px', height: '18px', accentColor: 'var(--accent-blue)' }}
        />
        🔗 Chain to another capsule (opens only after the previous one is opened)
      </label>

      {enabled && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : capsules.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem' }}>
              No locked capsules available to chain to. Create another capsule first.
            </p>
          ) : (
            <>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Select the capsule that must be opened before this one can unlock:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {capsules.map((capsule) => (
                  <label
                    key={capsule.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: selectedId === capsule.id
                        ? 'rgba(96, 165, 250, 0.1)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${selectedId === capsule.id
                        ? 'rgba(96, 165, 250, 0.3)'
                        : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="radio"
                      name="prerequisite"
                      checked={selectedId === capsule.id}
                      onChange={() => onChange(capsule.id)}
                      style={{ accentColor: 'var(--accent-blue)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                        {capsule.title}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        display: 'block',
                        marginTop: '0.15rem',
                      }}>
                        Opens: {new Date(capsule.unlockAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      color: 'var(--accent-amber)',
                    }}>
                      🔒 Locked
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ChainPicker;
