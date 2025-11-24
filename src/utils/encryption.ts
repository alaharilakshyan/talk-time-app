/**
 * End-to-End Encryption utilities for chat messages
 * Uses Web Crypto API for secure encryption/decryption
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

/**
 * Generate a cryptographic key from a password
 */
async function deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a user-specific encryption key based on user ID
 */
async function getUserKey(userId: string): Promise<CryptoKey> {
  const salt = new TextEncoder().encode(`chatbuzz-salt-${userId}`).buffer;
  return deriveKey(userId, salt);
}

/**
 * Encrypt a message
 */
export async function encryptMessage(message: string, userId: string): Promise<string> {
  try {
    const key = await getUserKey(userId);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv,
      },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt a message
 */
export async function decryptMessage(encryptedMessage: string, userId: string): Promise<string> {
  try {
    const key = await getUserKey(userId);
    
    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv,
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Encrypted message - unable to decrypt]';
  }
}

/**
 * Check if a string is encrypted (base64 format check)
 */
export function isEncrypted(message: string): boolean {
  try {
    return /^[A-Za-z0-9+/=]+$/.test(message) && message.length > 20;
  } catch {
    return false;
  }
}
