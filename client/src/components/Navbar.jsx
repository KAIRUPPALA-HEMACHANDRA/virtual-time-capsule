import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Navbar
 * 
 * Shows at the top of every page when the user is logged in.
 * Displays the app name, navigation links, user's name, and logout button.
 */

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  }

  return (
    <nav style={{
      background: 'rgba(17, 17, 40, 0.9)',
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
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo / App Name */}
        <Link to="/dashboard" style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#e8e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>🕰️</span>
          <span className="text-gradient">Time Capsule</span>
        </Link>

        {/* Nav Links + User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
        }}>
          <Link to="/dashboard" style={{
            color: '#9ca3af',
            fontSize: '0.9rem',
            transition: 'color 0.2s',
          }}>
            My Capsules
          </Link>

          <Link to="/capsule/new" style={{
            color: '#9ca3af',
            fontSize: '0.9rem',
            transition: 'color 0.2s',
          }}>
            + Create
          </Link>

          {/* User Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginLeft: '0.5rem',
            paddingLeft: '1.5rem',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <span style={{
              fontSize: '0.85rem',
              color: '#9ca3af',
            }}>
              {user?.name}
            </span>

            <button
              onClick={handleLogout}
              style={{
                padding: '0.4rem 1rem',
                background: 'rgba(248, 113, 113, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(248, 113, 113, 0.2)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(248, 113, 113, 0.1)'}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
