import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

/**
 * NotificationBell
 * 
 * Shows a bell icon with unread count badge in the navbar.
 * Clicking it opens a dropdown with recent notifications.
 */

function NotificationBell() {
  const { notifications, setNotifications, unreadCount, setUnreadCount } = useSocket();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications on first open
  useEffect(() => {
    if (open && notifications.length === 0) {
      fetchNotifications();
    }
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch initial unread count
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  async function fetchUnreadCount() {
    try {
      const { data } = await api.get('/notifications');
      setUnreadCount(data.data.unreadCount);
      setNotifications(data.data.notifications);
    } catch {
      // Non-critical
    }
  }

  async function fetchNotifications() {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }

    async function handleNotificationClick(notification) {
    if (!notification.read) {
      try {
        await api.patch(`/notifications/${notification.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {}
    }
    if (notification.capsuleId) {
      navigate(`/capsule/${notification.capsuleId}`);
    }
    setOpen(false);
  }
  // function handleNotificationClick(notification) {
  //   if (notification.capsuleId) {
  //     navigate(`/capsule/${notification.capsuleId}`);
  //   }
  //   setOpen(false);
  // }

  function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.2rem',
          position: 'relative',
          padding: '0.25rem',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#f87171',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          width: '320px',
          maxHeight: '400px',
          overflowY: 'auto',
          background: '#1a1a2e',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 200,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-purple)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: n.capsuleId ? 'pointer' : 'default',
                  background: n.read ? 'transparent' : 'rgba(167, 139, 250, 0.05)',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseOut={(e) => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(167, 139, 250, 0.05)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{
                    fontSize: '0.85rem',
                    color: n.read ? 'var(--text-muted)' : 'var(--text-primary)',
                    flex: 1,
                    lineHeight: 1.4,
                  }}>
                    {n.message}
                  </p>
                  {!n.read && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--accent-purple)',
                      flexShrink: 0,
                      marginTop: '4px',
                      marginLeft: '8px',
                    }} />
                  )}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {timeAgo(n.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
