function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function createSaltBase64(byteLength = 16) {
  const salt = new Uint8Array(byteLength);
  crypto.getRandomValues(salt);
  return bytesToBase64(salt);
}

export async function hashPasswordPBKDF2(password: string, saltBase64: string) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const salt = base64ToBytes(saltBase64);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 120_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return bytesToBase64(new Uint8Array(bits));
}

