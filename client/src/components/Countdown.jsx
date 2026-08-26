import { useState, useEffect } from 'react';

/**
 * Countdown
 * 
 * A live countdown timer that ticks every second.
 * Shows days, hours, minutes, seconds until a capsule unlocks.
 * 
 * USAGE:
 *   <Countdown targetDate="2027-01-01T00:00:00.000Z" />
 */

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const diff = new Date(targetDate).getTime() - Date.now();

    if (diff <= 0) {
      return null; // Time has passed
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <span style={{ color: 'var(--accent-green)' }}>Ready to open!</span>;
  }

  const blocks = [
    { value: timeLeft.days, label: 'd' },
    { value: timeLeft.hours, label: 'h' },
    { value: timeLeft.minutes, label: 'm' },
    { value: timeLeft.seconds, label: 's' },
  ];

  return (
    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
      {blocks.map((block, i) => (
        <div key={i} style={{
          background: 'rgba(167, 139, 250, 0.1)',
          border: '1px solid rgba(167, 139, 250, 0.15)',
          borderRadius: '6px',
          padding: '0.25rem 0.5rem',
          minWidth: '42px',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--accent-purple)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {String(block.value).padStart(2, '0')}
          </span>
          <span style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            marginLeft: '1px',
          }}>
            {block.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default Countdown;
