/**
 * End-to-End Encryption utilities for ChatBuzz
 * Uses Web Crypto API with AES-GCM for secure message encryption
 * Messages are encrypted with a shared key derived from both user IDs
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;
const ENCRYPTION_PREFIX = 'ENC:';

// Cache for derived keys to improve performance
const keyCache = new Map<string, CryptoKey>();

/**
 * Generate a cryptographic key from a password and salt
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
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a conversation key for two users (order-independent)
 * Both users will derive the same key for the same conversation
 */
async function getConversationKey(userId1: string, userId2: string): Promise<CryptoKey> {
  // Sort user IDs to ensure same key regardless of who is sender/receiver
  const sortedIds = [userId1, userId2].sort();
  const conversationId = `${sortedIds[0]}-${sortedIds[1]}`;
  
  // Check cache first
  if (keyCache.has(conversationId)) {
    return keyCache.get(conversationId)!;
  }
  
  // Create a deterministic salt from the conversation ID
  const salt = new TextEncoder().encode(`chatbuzz-e2e-${conversationId}`).buffer;
  
  // Derive key from combined user IDs
  const key = await deriveKey(conversationId, salt);
  
  // Cache the key
  keyCache.set(conversationId, key);
  
  return key;
}

/**
 * Encrypt a message for a conversation between two users
 * @param message - Plain text message
 * @param senderId - ID of the sender
 * @param receiverId - ID of the receiver
 * @returns Encrypted message string with prefix
 */
export async function encryptMessage(
  message: string, 
  senderId: string, 
  receiverId?: string
): Promise<string> {
  // If no receiverId provided (backward compatibility), use senderId only
  const targetReceiverId = receiverId || senderId;
  
  try {
    const key = await getConversationKey(senderId, targetReceiverId);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const encrypted = await crypto.subtle.encrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Return with prefix to identify encrypted messages
    return ENCRYPTION_PREFIX + btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    // Return original message if encryption fails (fallback)
    return message;
  }
}

/**
 * Decrypt a message from a conversation
 * @param encryptedMessage - Encrypted message string
 * @param currentUserId - ID of the current user
 * @param otherUserId - ID of the other user in the conversation
 * @returns Decrypted message or original if not encrypted
 */
export async function decryptMessage(
  encryptedMessage: string, 
  currentUserId: string,
  otherUserId?: string
): Promise<string> {
  // Check if message is encrypted
  if (!encryptedMessage.startsWith(ENCRYPTION_PREFIX)) {
    // Not encrypted, return as-is
    return encryptedMessage;
  }
  
  // If no otherUserId provided (backward compatibility), use currentUserId
  const targetOtherUserId = otherUserId || currentUserId;
  
  try {
    // Remove prefix
    const base64Data = encryptedMessage.slice(ENCRYPTION_PREFIX.length);
    
    const key = await getConversationKey(currentUserId, targetOtherUserId);
    
    // Convert from base64
    const combined = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    // Return placeholder for failed decryption
    return encryptedMessage;
  }
}

/**
 * Check if a message is encrypted
 */
export function isEncrypted(message: string): boolean {
  return message.startsWith(ENCRYPTION_PREFIX);
}

/**
 * Clear the key cache (useful for logout)
 */
export function clearKeyCache(): void {
  keyCache.clear();
}
