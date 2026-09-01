import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import NotificationBell from './NotificationBell';


function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
    setMenuOpen(false);
  }

  return (
    <nav style={{
      background: 'rgba(17, 17, 40, 0.95)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 1.5rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: '#e8e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>🕰️</span>
          <span className="text-gradient">Time Capsule</span>
        </Link>

        {/* Desktop Nav */}
        <div className="nav-desktop" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
        }}>
          <Link to="/dashboard" style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            My Capsules
          </Link>
          <Link to="/capsule/new" style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            + Create
          </Link>
          <Link to="/profile" style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Profile
          </Link>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginLeft: '0.5rem',
            paddingLeft: '1.25rem',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <NotificationBell />
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{user?.name}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.35rem 0.85rem',
                background: 'rgba(248, 113, 113, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#e8e8f0',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="nav-mobile-menu" style={{
          display: 'none',
          flexDirection: 'column',
          padding: '1rem 1.5rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(17, 17, 40, 0.98)',
          gap: '0.25rem',
        }}>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={mobileLink}>
            📦 My Capsules
          </Link>
          <Link to="/capsule/new" onClick={() => setMenuOpen(false)} style={mobileLink}>
            ✨ Create New
          </Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)} style={mobileLink}>
            👤 Profile
          </Link>
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', margin: '0.5rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <NotificationBell />
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{user?.name}</span>
            <button onClick={handleLogout} style={{
              padding: '0.4rem 1rem',
              background: 'rgba(248, 113, 113, 0.1)',
              color: '#f87171',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Responsive CSS for nav */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: block !important; }
          .nav-mobile-menu { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

const mobileLink = {
  color: '#c8c8d8',
  fontSize: '0.95rem',
  padding: '0.6rem 0.5rem',
  borderRadius: '8px',
  transition: 'background 0.2s',
};

export default Navbar;
