import { Link } from 'react-router-dom';

/**
 * ChainStatus
 * 
 * Shows on the ViewCapsule page when the capsule is part of a chain.
 * Displays whether the prerequisite is still locked or has been opened,
 * and links to the prerequisite capsule.
 */

function ChainStatus({ capsule }) {
  if (!capsule.prerequisiteId) return null;

  const prerequisite = capsule.prerequisite;
  const isPrerequisiteOpened = prerequisite &&
    (prerequisite.status === 'OPENED' || prerequisite.status === 'UNLOCKED');

  return (
    <div style={{
      background: 'rgba(96, 165, 250, 0.06)',
      border: '1px solid rgba(96, 165, 250, 0.15)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem',
      marginTop: '1rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
      }}>
        <span style={{ fontSize: '1.2rem' }}>🔗</span>
        <h3 style={{ color: 'var(--accent-blue)', fontSize: '1rem' }}>
          Chained Capsule
        </h3>
      </div>

      {prerequisite ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
              Requires opening first:
            </p>
            <Link to={`/capsule/${prerequisite.id}`} style={{
              fontSize: '0.95rem',
              fontWeight: 500,
              color: 'var(--accent-blue)',
            }}>
              "{prerequisite.title}"
            </Link>
          </div>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            background: isPrerequisiteOpened
              ? 'rgba(74, 222, 128, 0.1)'
              : 'rgba(251, 191, 36, 0.1)',
            color: isPrerequisiteOpened
              ? 'var(--accent-green)'
              : 'var(--accent-amber)',
          }}>
            {isPrerequisiteOpened ? '✅ Opened' : '🔒 Still locked'}
          </span>
        </div>
      ) : (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          This capsule requires opening another capsule first, but that capsule was deleted.
        </p>
      )}

      {!isPrerequisiteOpened && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          This capsule cannot be opened until the prerequisite capsule above is opened first.
        </p>
      )}
    </div>
  );
}

export default ChainStatus;
