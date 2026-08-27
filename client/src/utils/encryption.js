/**
 * End-to-End Encryption Utility
 * 
 * Encrypts and decrypts capsule content entirely in the browser.
 * The server NEVER sees the plaintext — it only stores encrypted data.
 * 
 * HOW IT WORKS:
 * 
 * ENCRYPTION (when creating a capsule):
 * 1. User enters a passphrase (like a password for the capsule)
 * 2. We derive an AES-256 key from the passphrase using PBKDF2
 *    (Password-Based Key Derivation Function 2)
 * 3. We generate a random 12-byte IV (Initialization Vector)
 * 4. We encrypt the content using AES-256-GCM with the key and IV
 * 5. We send the encrypted data + salt + IV to the server
 * 6. The server stores it — it cannot read it without the passphrase
 * 
 * DECRYPTION (when opening a capsule):
 * 1. User enters the same passphrase
 * 2. We derive the same key using PBKDF2 with the stored salt
 * 3. We decrypt using AES-256-GCM with the key and stored IV
 * 4. If the passphrase is wrong, decryption fails gracefully
 * 
 * TECHNICAL DETAILS:
 * - AES-256-GCM: Military-grade symmetric encryption with authentication
 * - PBKDF2: Converts a human-readable passphrase into a cryptographic key
 *   using 100,000 iterations (makes brute-force attacks extremely slow)
 * - Salt: Random data mixed with the passphrase so identical passphrases
 *   produce different keys
 * - IV: Ensures the same plaintext + key produces different ciphertext each time
 */

// Convert string to ArrayBuffer
function stringToBuffer(str) {
  return new TextEncoder().encode(str);
}

// Convert ArrayBuffer to string
function bufferToString(buffer) {
  return new TextDecoder().decode(buffer);
}

// Convert ArrayBuffer to Base64 string (for sending to server)
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 string back to ArrayBuffer
function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derive an AES-256 encryption key from a passphrase
 * Uses PBKDF2 with 100,000 iterations for security
 */
async function deriveKey(passphrase, salt) {
  // Import the passphrase as a CryptoKey
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive an AES-256-GCM key from it
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * ENCRYPT content with a passphrase
 * Returns an object with encrypted data, salt, and IV — all as Base64 strings
 */
export async function encryptContent(plaintext, passphrase) {
  // Generate random salt (16 bytes) and IV (12 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive encryption key from passphrase
  const key = await deriveKey(passphrase, salt);

  // Encrypt the content
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    stringToBuffer(plaintext)
  );

  // Return everything the server needs to store (but can't read)
  return {
    encryptedData: bufferToBase64(encrypted),
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
  };
}

/**
 * DECRYPT content with a passphrase
 * Returns the original plaintext, or throws if the passphrase is wrong
 */
export async function decryptContent(encryptedData, salt, iv, passphrase) {
  try {
    // Recreate the same key from the passphrase and stored salt
    const key = await deriveKey(passphrase, base64ToBuffer(salt));

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBuffer(iv) },
      key,
      base64ToBuffer(encryptedData)
    );

    return bufferToString(decrypted);
  } catch {
    throw new Error('Decryption failed. Wrong passphrase.');
  }
}
