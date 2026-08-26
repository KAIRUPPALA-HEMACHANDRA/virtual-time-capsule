import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import capsuleService from '../services/capsuleService';
import Navbar from '../components/Navbar';

function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, locked: 0, unlocked: 0, opened: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const response = await capsuleService.getMyCapsules();
      const capsules = response.data.capsules;

      setStats({
        total: capsules.length,
        locked: capsules.filter((c) => c.status === 'LOCKED').length,
        unlocked: capsules.filter((c) => c.status === 'UNLOCKED').length,
        opened: capsules.filter((c) => c.status === 'OPENED').length,
      });
    } catch {
      // Stats are non-critical, fail silently
    } finally {
      setLoading(false);
    }
  }

  // Calculate how long the user has been a member
  function getMemberDuration() {
    if (!user?.createdAt) return 'Just joined';
    const created = new Date(user.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Joined today';
    if (diffDays === 1) return 'Joined yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  const statCards = [
    { label: 'Total Capsules', value: stats.total, icon: '🕰️', color: 'var(--accent-purple)' },
    { label: 'Locked', value: stats.locked, icon: '🔒', color: 'var(--accent-amber)' },
    { label: 'Unlocked', value: stats.unlocked, icon: '🔓', color: 'var(--accent-green)' },
    { label: 'Opened', value: stats.opened, icon: '📖', color: 'var(--accent-blue)' },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      <div className="container page">
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          {/* Profile Header Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            {/* Avatar Circle */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--gradient-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '2rem',
              color: '#0a0a1a',
              fontWeight: 700,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {user?.name}
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {user?.email}
            </p>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              🗓️ Member since {getMemberDuration()} · {new Date(user?.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            {statCards.map((stat, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: stat.color,
                  lineHeight: 1,
                  marginBottom: '0.3rem',
                }}>
                  {loading ? '-' : stat.value}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Account Details Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 2rem',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Account Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Full Name</span>
                  <span style={{ fontSize: '0.95rem' }}>{user?.name}</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                  <span style={{ fontSize: '0.95rem' }}>{user?.email}</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>User ID</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {user?.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;
