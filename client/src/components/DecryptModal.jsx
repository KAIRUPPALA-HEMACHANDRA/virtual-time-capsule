import { useState } from 'react';
import { decryptContent } from '../utils/encryption';
import toast from 'react-hot-toast';

/**
 * DecryptModal
 * 
 * Shown when viewing an encrypted capsule that has been unlocked.
 * The user enters their passphrase to decrypt the content in the browser.
 * If the passphrase is wrong, decryption fails and an error is shown.
 */

function DecryptModal({ encryptedData, salt, iv, onDecrypted }) {
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  async function handleDecrypt(e) {
    e.preventDefault();

    if (!passphrase.trim()) {
      toast.error('Please enter the passphrase');
      return;
    }

    setDecrypting(true);

    try {
      const plaintext = await decryptContent(encryptedData, salt, iv, passphrase);
      onDecrypted(plaintext);
      toast.success('Content decrypted! 🔓');
    } catch {
      toast.error('Wrong passphrase. Please try again.');
    } finally {
      setDecrypting(false);
    }
  }

  return (
    <div style={{
      background: 'rgba(74, 222, 128, 0.05)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid rgba(74, 222, 128, 0.15)',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔐</div>
      <h3 style={{ color: 'var(--accent-green)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
        Encrypted Content
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        This capsule is end-to-end encrypted. Enter the passphrase to decrypt it.
      </p>

      <form onSubmit={handleDecrypt} style={{ maxWidth: '350px', margin: '0 auto' }}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <input
            type={showPassphrase ? 'text' : 'password'}
            className="form-input"
            placeholder="Enter passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            style={{ textAlign: 'center', paddingRight: '3rem' }}
            autoFocus
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
            }}
          >
            {showPassphrase ? '🙈' : '👁️'}
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={decrypting || !passphrase.trim()}
        >
          {decrypting ? 'Decrypting...' : '🔓 Decrypt Content'}
        </button>
      </form>
    </div>
  );
}

export default DecryptModal;
