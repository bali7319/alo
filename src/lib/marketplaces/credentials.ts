import { decrypt, encrypt } from '@/lib/encryption';

/**
 * Marketplace credentials are stored encrypted in DB.
 * We keep them as JSON to support different providers.
 */
export function encryptMarketplaceCredentials(credentials: unknown): string {
  return encrypt(JSON.stringify(credentials ?? {}));
}

export function decryptMarketplaceCredentials<T = any>(credentialsEnc: string): T {
  const json = decrypt(credentialsEnc);
  return JSON.parse(json) as T;
}

