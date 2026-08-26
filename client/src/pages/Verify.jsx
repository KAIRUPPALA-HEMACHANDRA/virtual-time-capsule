import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

/**
 * Public Verification Page
 * 
 * Anyone can view this page — no login required.
 * Shows the proof-of-creation certificate for a capsule:
 * - Hash value
 * - Algorithm used
 * - Creation timestamp
 * - Creator name
 * 
 * This proves the capsule content existed at a specific time
 * WITHOUT revealing what the content says.
 */

function Verify() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  async function fetchCertificate() {
    try {
      const { data } = await api.get(`/verify/${id}`);
      setCertificate(data.data.certificate);
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate not found');
    } finally {
      setLoading(false);
    }
  }

  function copyHash() {
    navigator.clipboard.writeText(certificate.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gradient-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ marginBottom: '0.5rem' }}>{error}</h2>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Go Home</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-main)', padding: '2rem' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛡️</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            <span className="text-gradient">Proof of Creation</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Cryptographic proof that this content existed at a specific time
          </p>
        </div>

        {/* Certificate Card */}
        <div style={{
          background: 'rgba(17, 17, 40, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {/* Status Bar */}
          <div style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(74, 222, 128, 0.08)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{ color: 'var(--accent-green)', fontSize: '0.9rem', fontWeight: 500 }}>
              ✅ Verified Certificate
            </span>
          </div>

          <div style={{ padding: '2rem' }}>
            {/* Capsule Title */}
            <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              "{certificate.title}"
            </h2>

            {/* Hash Display */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                SHA-256 Content Hash
              </label>
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                wordBreak: 'break-all',
                color: 'var(--accent-green)',
                border: '1px solid rgba(74, 222, 128, 0.15)',
                position: 'relative',
              }}>
                {certificate.hash}
                <button
                  onClick={copyHash}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                  }}
                >
                  {copied ? '✅ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Algorithm</span>
                <span style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{certificate.algorithm}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Created At</span>
                <span style={{ fontSize: '0.9rem' }}>
                  {new Date(certificate.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Created By</span>
                <span style={{ fontSize: '0.9rem' }}>{certificate.createdBy}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Capsule Status</span>
                <span style={{ fontSize: '0.9rem' }}>{certificate.capsuleStatus}</span>
              </div>
            </div>

            {/* What this means */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              background: 'rgba(167, 139, 250, 0.05)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(167, 139, 250, 0.1)',
            }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--accent-purple)' }}>What this proves:</strong> The content of this 
                capsule existed at the timestamp shown above. The SHA-256 hash was generated from the title, 
                content, and timestamp at the moment of creation. This hash cannot be reversed — it only 
                confirms that the content has not been altered since creation.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            🕰️ Virtual Time Capsule
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Verify;
