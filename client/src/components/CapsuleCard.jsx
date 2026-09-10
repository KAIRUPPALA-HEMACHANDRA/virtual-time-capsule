import { useNavigate } from 'react-router-dom';
import Countdown from './Countdown';

function CapsuleCard({ capsule }) {
  const navigate = useNavigate();

  const statusConfig = {
    LOCKED: { label: '🔒 Locked', color: 'var(--accent-amber)', bg: 'rgba(251, 191, 36, 0.1)' },
    UNLOCKED: { label: '🔓 Unlocked', color: 'var(--accent-green)', bg: 'rgba(74, 222, 128, 0.1)' },
    OPENED: { label: '📖 Opened', color: 'var(--accent-blue)', bg: 'rgba(96, 165, 250, 0.1)' },
  };

  const status = statusConfig[capsule.status] || statusConfig.LOCKED;
  const attachmentCount = capsule.attachmentCount || capsule.attachments?.length || 0;

  return (
    <div
      onClick={() => navigate(`/capsule/${capsule.id}`)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'var(--bg-card-hover)';
        e.currentTarget.style.borderColor = 'var(--border-accent)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'var(--bg-card)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top row: title + status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.75rem',
        gap: '1rem',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
          {capsule.title}
        </h3>
        <span style={{
          fontSize: '0.75rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          background: status.bg,
          color: status.color,
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}>
          {status.label}
        </span>
      </div>

      {/* Countdown or content preview */}
      {capsule.status === 'LOCKED' ? (
        <div style={{ marginBottom: '0.75rem' }}>
          <Countdown targetDate={capsule.unlockAt} />
        </div>
      ) : (
        capsule.content && (
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {capsule.content.substring(0, 100)}{capsule.content.length > 100 ? '...' : ''}
          </p>
        )
      )}

      {/* Feature badges */}
      {(capsule.isGeoLocked || capsule.isEncrypted || capsule.isLegacy || capsule.prerequisiteId || capsule.isAnonymous || capsule.selfDestructAfterRead) && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginBottom: '0.75rem',
        }}>
          {capsule.isGeoLocked && (
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }}>📍 Geo-locked</span>
          )}
          {capsule.isEncrypted && (
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa' }}>🔐 Encrypted</span>
          )}
          {capsule.isLegacy && (
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'rgba(251, 146, 60, 0.1)', color: '#fb923c' }}>🕊️ Legacy</span>
          )}
          {capsule.prerequisiteId && (
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf' }}>🔗 Chained</span>
          )}
          {capsule.isAnonymous && (
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' }}>🎭 Anonymous</span>
          )}
          {capsule.selfDestructAfterRead && (
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>💥 Self-destruct</span>
          )}
        </div>
      )}

      {/* Bottom row: dates + attachment count */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}>
        <span>Created: {new Date(capsule.createdAt).toLocaleDateString()}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {attachmentCount > 0 && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--text-secondary)',
            }}>
              📎 {attachmentCount}
            </span>
          )}
          <span>Opens: {new Date(capsule.unlockAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default CapsuleCard;
