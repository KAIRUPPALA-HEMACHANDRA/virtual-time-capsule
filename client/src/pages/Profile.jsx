import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import capsuleService from '../services/capsuleService';
import authService from '../services/authService';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import EmotionTimeline from '../components/EmotionTimeline';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, locked: 0, unlocked: 0, opened: 0 });
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
      // Non-critical
    } finally {
      setLoading(false);
    }
  }

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

  async function handlePasswordChange(e) {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed! Please log in again.');
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
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

          {/* Profile Header */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
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
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user?.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{user?.email}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              🗓️ Member since {getMemberDuration()} · {new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Stats */}
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
                <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color, lineHeight: 1, marginBottom: '0.3rem' }}>
                  {loading ? '-' : stat.value}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Account Details */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 2rem',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Account Details</h2>

            {[
              { label: 'Full Name', value: user?.name },
              { label: 'Email Address', value: user?.email },
              { label: 'User ID', value: user?.id, mono: true },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1rem',
                marginBottom: i < 2 ? '1rem' : 0,
                borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{item.label}</span>
                  <span style={{
                    fontSize: item.mono ? '0.8rem' : '0.95rem',
                    color: item.mono ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontFamily: item.mono ? 'monospace' : 'inherit',
                  }}>
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Change Password Section */}
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
              marginBottom: showPasswordForm ? '1.25rem' : 0,
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Security</h2>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                {showPasswordForm ? 'Cancel' : '🔑 Change Password'}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter your current password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Type new password again"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                    required
                    minLength={8}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordLoading}
                  style={{ width: '100%' }}
                >
                  {passwordLoading ? 'Changing...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
          {/* Emotion Timeline */}
          <div style={{ marginTop: '1.5rem' }}>
            <EmotionTimeline />
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;
