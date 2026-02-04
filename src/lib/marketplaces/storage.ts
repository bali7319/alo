import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import type { MarketplaceProvider } from '@prisma/client';

type ConnectionRecord = {
  id: string;
  provider: MarketplaceProvider;
  name: string;
  isActive: boolean;
  credentialsEnc: string;
  credentialsHint: string | null;
  metadata: any;
  lastTestAt: string | null;
  lastTestOk: boolean;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

type StorageData = {
  connections: ConnectionRecord[];
  products: any[];
  orders: any[];
};

export type MarketplaceStorage = {
  listConnections(): Promise<ConnectionRecord[]>;
  getConnection(id: string): Promise<ConnectionRecord | null>;
  getConnectionByProvider(provider: MarketplaceProvider): Promise<ConnectionRecord | null>;
  createConnection(input: Omit<ConnectionRecord, 'id' | 'createdAt' | 'updatedAt' | 'lastTestAt' | 'lastTestOk' | 'lastError'>): Promise<ConnectionRecord>;
  updateConnection(
    id: string,
    patch: Partial<
      Pick<ConnectionRecord, 'name' | 'isActive' | 'credentialsEnc' | 'credentialsHint' | 'metadata' | 'lastTestAt' | 'lastTestOk' | 'lastError'>
    >
  ): Promise<ConnectionRecord>;
  deleteConnection(id: string): Promise<void>;
  listProducts(opts: { connectionId?: string; q?: string; limit: number }): Promise<any[]>;
  listOrders(opts: { connectionId?: string; q?: string; status?: string; limit: number }): Promise<any[]>;
  replaceProductsForConnection(connectionId: string, products: any[]): Promise<void>;
  replaceOrdersForConnection(connectionId: string, orders: any[]): Promise<void>;
};

function getDataDir() {
  // Keep it in workspace; do not commit.
  return process.env.MARKETPLACE_DATA_DIR || path.join(process.cwd(), '.data', 'marketplaces');
}

function getDataFile() {
  return path.join(getDataDir(), 'data.json');
}

async function ensureDir() {
  await fs.mkdir(getDataDir(), { recursive: true });
}

async function readJson(): Promise<StorageData> {
  try {
    const buf = await fs.readFile(getDataFile());
    const parsed = JSON.parse(buf.toString('utf8'));
    return {
      connections: Array.isArray(parsed?.connections) ? parsed.connections : [],
      products: Array.isArray(parsed?.products) ? parsed.products : [],
      orders: Array.isArray(parsed?.orders) ? parsed.orders : [],
    };
  } catch {
    return { connections: [], products: [], orders: [] };
  }
}

async function writeJsonAtomic(data: StorageData) {
  await ensureDir();
  const file = getDataFile();
  const tmp = `${file}.${crypto.randomBytes(8).toString('hex')}.tmp`;
  const payload = JSON.stringify(data, null, 2);
  await fs.writeFile(tmp, payload, 'utf8');
  await fs.rename(tmp, file);
}

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID();
}

function normalizeQ(q?: string) {
  return (q || '').trim().toLowerCase();
}

function includesCI(hay: any, needle: string) {
  if (!needle) return true;
  if (!hay) return false;
  return String(hay).toLowerCase().includes(needle);
}

export function getMarketplaceStorage(): MarketplaceStorage {
  // Default to file storage unless explicitly set to prisma.
  const mode = (process.env.MARKETPLACE_STORAGE || 'file').toLowerCase();
  if (mode !== 'file') {
    // File mode is the only one guaranteed to work without DB/Docker.
    // Prisma mode will be added when Postgres is ready.
  }

  return {
    async listConnections() {
      const data = await readJson();
      return data.connections.sort((a, b) => (a.provider + a.name).localeCompare(b.provider + b.name));
    },

    async getConnection(id: string) {
      const data = await readJson();
      return data.connections.find((c) => c.id === id) || null;
    },

    async getConnectionByProvider(provider: MarketplaceProvider) {
      const data = await readJson();
      return data.connections.find((c) => c.provider === provider) || null;
    },

    async createConnection(input) {
      const data = await readJson();

      // Enforce unique(provider,name) like DB version.
      const exists = data.connections.some((c) => c.provider === input.provider && c.name === input.name);
      if (exists) {
        throw new Error('Bu provider + ad ile zaten bir bağlantı var.');
      }

      const rec: ConnectionRecord = {
        id: newId(),
        provider: input.provider,
        name: input.name,
        isActive: input.isActive,
        credentialsEnc: input.credentialsEnc,
        credentialsHint: input.credentialsHint ?? null,
        metadata: input.metadata ?? null,
        lastTestAt: null,
        lastTestOk: false,
        lastError: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      data.connections.push(rec);
      await writeJsonAtomic(data);
      return rec;
    },

    async updateConnection(id, patch) {
      const data = await readJson();
      const idx = data.connections.findIndex((c) => c.id === id);
      if (idx < 0) throw new Error('Bağlantı bulunamadı');

      const cur = data.connections[idx];
      const next: ConnectionRecord = {
        ...cur,
        ...patch,
        updatedAt: nowIso(),
      };

      // if provider/name combo changed, re-check uniqueness
      const provider = next.provider;
      const name = next.name;
      const duplicate = data.connections.some((c) => c.id !== id && c.provider === provider && c.name === name);
      if (duplicate) throw new Error('Bu provider + ad ile zaten bir bağlantı var.');

      data.connections[idx] = next;
      await writeJsonAtomic(data);
      return next;
    },

    async deleteConnection(id) {
      const data = await readJson();
      data.connections = data.connections.filter((c) => c.id !== id);
      await writeJsonAtomic(data);
    },

    async listProducts({ connectionId, q, limit }) {
      const data = await readJson();
      const needle = normalizeQ(q);
      const filtered = (data.products || []).filter((p: any) => {
        if (connectionId && p.connectionId !== connectionId) return false;
        if (!needle) return true;
        return (
          includesCI(p.merchantSku, needle) ||
          includesCI(p.barcode, needle) ||
          includesCI(p.title, needle) ||
          includesCI(p.externalId, needle)
        );
      });
      return filtered.slice(0, limit);
    },

    async listOrders({ connectionId, q, status, limit }) {
      const data = await readJson();
      const needle = normalizeQ(q);
      const filtered = (data.orders || []).filter((o: any) => {
        if (connectionId && o.connectionId !== connectionId) return false;
        if (status && o.status !== status) return false;
        if (!needle) return true;
        return (
          includesCI(o.externalId, needle) ||
          includesCI(o.buyerName, needle) ||
          includesCI(o.buyerEmail, needle) ||
          includesCI(o.shippingName, needle)
        );
      });
      return filtered.slice(0, limit);
    },

    async replaceProductsForConnection(connectionId: string, products: any[]) {
      const data = await readJson();
      data.products = (data.products || []).filter((p: any) => p.connectionId !== connectionId);
      data.products.push(...products);
      await writeJsonAtomic(data);
    },

    async replaceOrdersForConnection(connectionId: string, orders: any[]) {
      const data = await readJson();
      data.orders = (data.orders || []).filter((o: any) => o.connectionId !== connectionId);
      data.orders.push(...orders);
      await writeJsonAtomic(data);
    },
  };
}

