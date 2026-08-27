import { useState } from 'react';

/**
 * EncryptionToggle
 * 
 * When enabled, the user enters a passphrase that encrypts the capsule content
 * before it reaches the server. They must remember this passphrase — without it,
 * the content is permanently unreadable (even by us).
 */

function EncryptionToggle({ encryptionData, onChange }) {
  const [showPassphrase, setShowPassphrase] = useState(false);

  function handleToggle(e) {
    onChange({
      ...encryptionData,
      isEncrypted: e.target.checked,
      passphrase: e.target.checked ? encryptionData.passphrase : '',
    });
  }

  return (
    <div style={{
      background: 'rgba(74, 222, 128, 0.04)',
      border: '1px solid rgba(74, 222, 128, 0.12)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem',
    }}>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        cursor: 'pointer',
        fontSize: '0.95rem',
        color: 'var(--text-secondary)',
        marginBottom: encryptionData.isEncrypted ? '1rem' : 0,
      }}>
        <input
          type="checkbox"
          checked={encryptionData.isEncrypted}
          onChange={handleToggle}
          style={{ width: '18px', height: '18px', accentColor: 'var(--accent-green)' }}
        />
        🔐 Encrypt this capsule (end-to-end, only openable with a passphrase)
      </label>

      {encryptionData.isEncrypted && (
        <>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassphrase ? 'text' : 'password'}
              className="form-input"
              placeholder="Enter a passphrase to seal this capsule"
              value={encryptionData.passphrase}
              onChange={(e) => onChange({ ...encryptionData, passphrase: e.target.value })}
              style={{ paddingRight: '3.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassphrase(!showPassphrase)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              {showPassphrase ? '🙈' : '👁️'}
            </button>
          </div>

          <div style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(248, 113, 113, 0.06)',
            border: '1px solid rgba(248, 113, 113, 0.12)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: 500, marginBottom: '0.25rem' }}>
              ⚠️ Important — Remember this passphrase!
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Your content is encrypted in the browser before reaching our server. 
              We never see the plaintext. If you forget the passphrase, the content 
              is permanently unrecoverable — even we cannot decrypt it.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default EncryptionToggle;
