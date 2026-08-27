import { useState } from 'react';

/**
 * RecipientInput
 * 
 * Lets users add recipient email addresses.
 * Recipients will be notified when the capsule unlocks.
 * Type an email, press Enter or click Add — it appears as a tag.
 */

function RecipientInput({ recipients, onChange }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function addRecipient(e) {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();

    if (!trimmed) return;

    if (!isValidEmail(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    if (recipients.includes(trimmed)) {
      setError('This email is already added');
      return;
    }

    if (recipients.length >= 10) {
      setError('Maximum 10 recipients per capsule');
      return;
    }

    onChange([...recipients, trimmed]);
    setEmail('');
  }

  function removeRecipient(emailToRemove) {
    onChange(recipients.filter((r) => r !== emailToRemove));
  }

  return (
    <div>
      <label className="form-label">Recipients (optional)</label>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        These people will be notified when the capsule unlocks.
      </p>

      {/* Email Tags */}
      {recipients.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginBottom: '0.75rem',
        }}>
          {recipients.map((r) => (
            <span key={r} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.75rem',
              background: 'rgba(96, 165, 250, 0.1)',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              color: 'var(--accent-blue)',
            }}>
              {r}
              <button
                type="button"
                onClick={() => removeRecipient(r)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-red)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="email"
          className="form-input"
          placeholder="friend@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRecipient(e); } }}
          style={{ flex: 1, fontSize: '0.9rem', padding: '0.6rem 1rem' }}
        />
        <button
          type="button"
          onClick={addRecipient}
          className="btn btn-secondary"
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
        >
          + Add
        </button>
      </div>

      {error && (
        <p style={{ fontSize: '0.8rem', color: 'var(--accent-red)', marginTop: '0.3rem' }}>
          {error}
        </p>
      )}

      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
        {recipients.length}/10 recipients · Press Enter to add
      </p>
    </div>
  );
}

export default RecipientInput;
