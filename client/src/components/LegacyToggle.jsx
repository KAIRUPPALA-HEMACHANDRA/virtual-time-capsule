/**
 * LegacyToggle
 * 
 * When enabled, the capsule won't unlock on a specific date.
 * Instead, it unlocks when the creator has been inactive
 * for a chosen number of days (30, 90, 180, 365).
 * 
 * This is a "digital will" — a message delivered to loved ones
 * if something happens to the creator.
 */

function LegacyToggle({ legacyData, onChange, onLegacyEnabled }) {
  const periods = [
    { days: 30, label: '30 days' },
    { days: 90, label: '3 months' },
    { days: 180, label: '6 months' },
    { days: 365, label: '1 year' },
  ];

  function handleToggle(e) {
    const enabled = e.target.checked;
    onChange({
      ...legacyData,
      isLegacy: enabled,
    });
    if (onLegacyEnabled) onLegacyEnabled(enabled);
  }

  return (
    <div style={{
      background: 'rgba(251, 191, 36, 0.04)',
      border: '1px solid rgba(251, 191, 36, 0.12)',
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
        marginBottom: legacyData.isLegacy ? '1rem' : 0,
      }}>
        <input
          type="checkbox"
          checked={legacyData.isLegacy}
          onChange={handleToggle}
          style={{ width: '18px', height: '18px', accentColor: 'var(--accent-amber)' }}
        />
        🕊️ Digital Legacy Mode (delivers when I'm inactive)
      </label>

      {legacyData.isLegacy && (
        <>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            This capsule will be delivered to recipients if you haven't logged in for:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            {periods.map((period) => (
              <button
                key={period.days}
                type="button"
                onClick={() => onChange({ ...legacyData, legacyDays: period.days })}
                style={{
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: legacyData.legacyDays === period.days
                    ? 'var(--accent-amber)'
                    : 'var(--border-subtle)',
                  background: legacyData.legacyDays === period.days
                    ? 'rgba(251, 191, 36, 0.15)'
                    : 'transparent',
                  color: legacyData.legacyDays === period.days
                    ? 'var(--accent-amber)'
                    : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: legacyData.legacyDays === period.days ? 600 : 400,
                }}
              >
                {period.label}
              </button>
            ))}
          </div>

          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(251, 191, 36, 0.06)',
            border: '1px solid rgba(251, 191, 36, 0.12)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 500, marginBottom: '0.25rem' }}>
              🕊️ How Legacy Mode works
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Our system checks daily. If you haven't logged in for {legacyData.legacyDays || '...'} days,
              this capsule will be unlocked and its recipients will be notified.
              Simply logging in resets the timer. Add recipients above so they receive your message.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default LegacyToggle;
