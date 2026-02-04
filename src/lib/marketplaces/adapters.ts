import type { MarketplaceProvider } from '@prisma/client';
import type { MarketplaceAdapter } from './types';

function notImplemented(provider: MarketplaceProvider): MarketplaceAdapter {
  return {
    provider,
    async testConnection() {
      return {
        ok: false,
        message: `${provider} entegrasyonu henüz uygulanmadı. Credential kaydı yapıldı; bir sonraki adım API çağrılarını eklemek.`,
      };
    },
  };
}

export function getMarketplaceAdapter(provider: MarketplaceProvider): MarketplaceAdapter {
  switch (provider) {
    case 'trendyol':
    case 'hepsiburada':
    case 'n11':
    case 'pazarama':
    case 'woocommerce':
      return notImplemented(provider);
    default: {
      const _exhaustive: never = provider;
      return notImplemented(_exhaustive);
    }
  }
}

