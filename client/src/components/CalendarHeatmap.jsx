import { useMemo } from 'react';

/**
 * Calendar Heatmap
 * 
 * A GitHub-style contribution graph showing capsule creation activity.
 * Each cell is one day. Darker purple = more capsules created that day.
 * Shows the last 6 months of activity.
 * 
 * HOW IT WORKS:
 * 1. Takes an array of capsules with createdAt dates
 * 2. Groups them by date (YYYY-MM-DD)
 * 3. Renders a grid of colored squares — one per day
 * 4. Hover shows the date and capsule count
 */

const CELL_SIZE = 13;
const CELL_GAP = 3;
const TOTAL = CELL_SIZE + CELL_GAP;
const WEEKS = 26; // ~6 months
const DAYS = 7;

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const COLORS = {
  0: 'rgba(255, 255, 255, 0.03)',
  1: 'rgba(167, 139, 250, 0.25)',
  2: 'rgba(167, 139, 250, 0.45)',
  3: 'rgba(167, 139, 250, 0.65)',
  4: 'rgba(167, 139, 250, 0.85)',
};

function getColor(count) {
  if (count === 0) return COLORS[0];
  if (count === 1) return COLORS[1];
  if (count === 2) return COLORS[2];
  if (count <= 4) return COLORS[3];
  return COLORS[4];
}

function CalendarHeatmap({ capsules = [] }) {
  const { grid, monthLabels, totalCapsules, activeDays } = useMemo(() => {
    // Build date count map
    const dateCounts = {};
    capsules.forEach((c) => {
      const date = new Date(c.createdAt).toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    // Build grid starting from (WEEKS * 7) days ago
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (WEEKS * 7 - 1));
    // Align to the most recent Sunday before or on startDate
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const grid = [];
    const months = [];
    let lastMonth = -1;

    for (let week = 0; week < WEEKS; week++) {
      const weekDays = [];
      for (let day = 0; day < DAYS; day++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + week * 7 + day);
        const dateStr = cellDate.toISOString().split('T')[0];
        const count = dateCounts[dateStr] || 0;
        const isFuture = cellDate > today;

        // Track month labels
        if (cellDate.getMonth() !== lastMonth && !isFuture) {
          lastMonth = cellDate.getMonth();
          months.push({
            label: cellDate.toLocaleDateString('en-US', { month: 'short' }),
            week,
          });
        }

        weekDays.push({
          date: dateStr,
          count,
          isFuture,
          display: cellDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
        });
      }
      grid.push(weekDays);
    }

    const activeDays = Object.keys(dateCounts).length;
    const totalCapsules = capsules.length;

    return { grid, monthLabels: months, totalCapsules, activeDays };
  }, [capsules]);

  if (capsules.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>📅 Activity Heatmap</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Create capsules to see your activity pattern over time.
        </p>
      </div>
    );
  }

  const svgWidth = WEEKS * TOTAL + 30;
  const svgHeight = DAYS * TOTAL + 20;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem 2rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>📅 Activity Heatmap</h3>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {totalCapsules} capsule{totalCapsules !== 1 ? 's' : ''} across {activeDays} day{activeDays !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <svg width={svgWidth} height={svgHeight + 15} style={{ display: 'block', margin: '0 auto' }}>
          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={m.week * TOTAL + 30}
              y={10}
              fill="#6b7280"
              fontSize="11"
              fontFamily="system-ui, sans-serif"
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map((label, i) => (
            label && (
              <text
                key={i}
                x={0}
                y={i * TOTAL + 28}
                fill="#6b7280"
                fontSize="10"
                fontFamily="system-ui, sans-serif"
                dominantBaseline="middle"
              >
                {label}
              </text>
            )
          ))}

          {/* Cells */}
          {grid.map((week, wi) =>
            week.map((day, di) => (
              <rect
                key={`${wi}-${di}`}
                x={wi * TOTAL + 30}
                y={di * TOTAL + 15}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                fill={day.isFuture ? 'transparent' : getColor(day.count)}
                stroke={day.isFuture ? 'none' : 'rgba(255,255,255,0.03)'}
                strokeWidth={0.5}
                style={{ cursor: day.isFuture ? 'default' : 'pointer' }}
              >
                {!day.isFuture && (
                  <title>{`${day.display}: ${day.count} capsule${day.count !== 1 ? 's' : ''}`}</title>
                )}
              </rect>
            ))
          )}
        </svg>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '0.35rem',
        marginTop: '0.75rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
      }}>
        <span>Less</span>
        {Object.values(COLORS).map((color, i) => (
          <div
            key={i}
            style={{
              width: 11,
              height: 11,
              borderRadius: 2,
              background: color,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default CalendarHeatmap;
