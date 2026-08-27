import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import api from '../services/api';

/**
 * Emotion Timeline
 * 
 * A beautiful chart showing how the user's emotional tone in their
 * capsule messages has changed over time. Each data point is a capsule.
 * 
 * The Y-axis shows sentiment score:
 *   Positive (happy/hopeful) → above the center line
 *   Negative (sad/melancholic) → below the center line
 *   Neutral → near the center
 */

const moodEmojis = {
  happy: '😊',
  hopeful: '🌤️',
  neutral: '😐',
  melancholic: '🥀',
  sad: '😢',
};

const moodColors = {
  happy: '#4ade80',
  hopeful: '#60a5fa',
  neutral: '#9ca3af',
  melancholic: '#fbbf24',
  sad: '#f87171',
};

function EmotionTimeline() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentiment();
  }, []);

  async function fetchSentiment() {
    try {
      const { data: res } = await api.get('/capsules/stats/sentiment');
      setData(res.data);
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!data || data.timeline.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>📊 Emotion Timeline</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Create more capsules with messages to see your emotional journey over time.
        </p>
      </div>
    );
  }

  const chartData = data.timeline.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    score: item.score,
    mood: item.mood,
    title: item.title,
  }));

  const { summary } = data;

  // Custom tooltip
  function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{
        background: '#1a1a2e',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        fontSize: '0.85rem',
      }}>
        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{d.title}</p>
        <p style={{ color: moodColors[d.mood] }}>
          {moodEmojis[d.mood]} {d.mood} ({d.score > 0 ? '+' : ''}{d.score})
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{d.date}</p>
      </div>
    );
  }

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
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>📊 Emotion Timeline</h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          color: moodColors[summary.averageMood],
        }}>
          Average: {moodEmojis[summary.averageMood]} {summary.averageMood}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#2a2a4a' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[-1, 1]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#2a2a4a" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={{ fill: '#a78bfa', r: 5, strokeWidth: 0 }}
              activeDot={{ fill: '#c4b5fd', r: 7, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mood Distribution */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.25rem',
        marginTop: '1.25rem',
        flexWrap: 'wrap',
      }}>
        {Object.entries(summary.moodCounts).map(([mood, count]) => (
          <div key={mood} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8rem',
            color: moodColors[mood] || 'var(--text-muted)',
          }}>
            <span>{moodEmojis[mood]}</span>
            <span>{mood}: {count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmotionTimeline;
