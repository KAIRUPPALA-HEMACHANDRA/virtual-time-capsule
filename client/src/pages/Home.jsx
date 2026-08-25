import { useState, useEffect } from 'react';

function Home() {
  const [serverStatus, setServerStatus] = useState('Checking...');

  useEffect(() => {
    // Test connection to the backend API
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setServerStatus(`✅ ${data.message}`);
      })
      .catch(() => {
        setServerStatus('❌ Backend server is not running');
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: '#e0e0e0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <h1 style={{
        fontSize: '3rem',
        marginBottom: '0.5rem',
        background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        🕰️ Virtual Time Capsule
      </h1>
      
      <p style={{ fontSize: '1.2rem', color: '#9ca3af', marginBottom: '2rem' }}>
        Preserve today. Unlock tomorrow.
      </p>

      <div style={{
        padding: '1rem 2rem',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '1rem',
      }}>
        <strong>Server Status:</strong> {serverStatus}
      </div>

      <p style={{ marginTop: '3rem', color: '#6b7280', fontSize: '0.9rem' }}>
        Phase 1, Feature 1 — Project Setup Complete ✅
      </p>
    </div>
  );
}

export default Home;
