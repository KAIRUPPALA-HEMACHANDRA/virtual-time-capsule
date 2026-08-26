import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gradient-main)',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🕰️</div>

      <h1 style={{
        fontSize: 'clamp(3rem, 10vw, 6rem)',
        fontWeight: 800,
        lineHeight: 1,
        marginBottom: '0.5rem',
      }}>
        <span className="text-gradient">404</span>
      </h1>

      <h2 style={{
        fontSize: '1.3rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '0.75rem',
      }}>
        This capsule doesn't exist yet
      </h2>

      <p style={{
        color: 'var(--text-muted)',
        fontSize: '1rem',
        maxWidth: '400px',
        marginBottom: '2rem',
        lineHeight: 1.6,
      }}>
        Maybe it's from the future, or maybe you took a wrong turn.
        Either way, let's get you back on track.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </Link>
        <Link to="/" className="btn btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
