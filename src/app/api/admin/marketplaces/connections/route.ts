import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { encryptMarketplaceCredentials } from '@/lib/marketplaces/credentials';
import { getMarketplaceStorage } from '@/lib/marketplaces/storage';
import { decryptMarketplaceCredentials } from '@/lib/marketplaces/credentials';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

function maskSecret(value: string | undefined | null) {
  const v = (value || '').trim();
  if (!v) return '';
  const last = v.slice(-4);
  return `${'*'.repeat(Math.max(8, v.length - 4))}${last}`;
}

function normalizeBaseUrl(input: string) {
  let v = (input || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  v = v.replace(/\/+$/, '');
  return v;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user?.email) {
    return { ok: false as const, res: NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 }) };
  }
  if (role !== 'admin') {
    return { ok: false as const, res: NextResponse.json({ error: 'Bu işlem için admin yetkisi gerekiyor' }, { status: 403 }) };
  }
  return { ok: true as const, session };
}

const CreateConnectionSchema = z.object({
  provider: z.enum(['trendyol', 'hepsiburada', 'n11', 'pazarama', 'woocommerce']),
  // UI artık name göndermez; her provider için tek kayıt.
  name: z.string().trim().min(2).max(64).optional(),
  isActive: z.boolean().optional().default(true),
  credentials: z.unknown().optional().default({}),
  credentialsHint: z.string().trim().max(200).optional(),
  metadata: z.unknown().optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const storage = getMarketplaceStorage();
  const connections = await storage.listConnections();

  // provider query varsa, tek provider için maskeli credential bilgisi de döndür.
  // (Secret asla plain dönmez.)
  // Örnek: /api/admin/marketplaces/connections?provider=woocommerce
  // Not: Next.js GET signature'da request yok, bu yüzden NextResponse.nextUrl kullanamayız.
  // Bu endpoint'te provider filtreleme için ayrı route kullanılabilir; burada sadece liste dönüyoruz.

  return NextResponse.json({ connections });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const body = await req.json().catch(() => null);
  const parsed = CreateConnectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz istek', details: parsed.error.flatten() }, { status: 400 });
  }

  const { provider, isActive, credentials, credentialsHint, metadata } = parsed.data;
  const requestedName = (parsed.data.name || '').trim();
  const name = requestedName || 'default';

  const credsObj = (credentials as any) || {};

  // Provider-specific credential shape
  let credentialsNormalized: any;
  if (provider === 'trendyol') {
    credentialsNormalized = {
      sellerId: (credsObj.sellerId ?? '').trim(),
      integrationRefCode: (credsObj.integrationRefCode ?? '').trim(),
      apiKey: (credsObj.apiKey ?? '').trim(),
      apiSecret: (credsObj.apiSecret ?? '').trim(),
      token: (credsObj.token ?? '').trim(),
    };
  } else if (provider === 'woocommerce') {
    const baseUrl = normalizeBaseUrl(credsObj.baseUrl || credsObj.storeUrl || '');
    const key = (credsObj.consumerKey || credsObj.key || '').trim();
    const secret = (credsObj.consumerSecret || credsObj.secret || '').trim();
    credentialsNormalized = { baseUrl, consumerKey: key, consumerSecret: secret };
  } else {
    // hepsiburada, n11, pazarama: generic pass-through
    const baseUrl = normalizeBaseUrl(credsObj.baseUrl || credsObj.storeUrl || '');
    const key = (credsObj.consumerKey || credsObj.key || credsObj.apiKey || '').trim();
    const secret = (credsObj.consumerSecret || credsObj.secret || credsObj.apiSecret || '').trim();
    credentialsNormalized = { baseUrl, consumerKey: key, consumerSecret: secret };
  }

  const storage = getMarketplaceStorage();
  const all = await storage.listConnections();
  const existing = all.find((c: any) => c.provider === provider) || null;

  try {
    if (!existing) {
      const credentialsEnc = encryptMarketplaceCredentials(credentialsNormalized);
      const created = await storage.createConnection({
        provider: provider as any,
        name,
        isActive,
        credentialsEnc,
        credentialsHint: credentialsHint || null,
        metadata: (metadata ?? null) as any,
      });
      return NextResponse.json({ connection: created }, { status: 201 });
    }

    // Update existing (single per provider). Blank fields keep existing values.
    const existingCreds = decryptMarketplaceCredentials<any>((existing as any).credentialsEnc);
    let merged: any;
    if (provider === 'trendyol') {
      merged = {
        sellerId: credentialsNormalized.sellerId || existingCreds?.sellerId || '',
        integrationRefCode: credentialsNormalized.integrationRefCode || existingCreds?.integrationRefCode || '',
        apiKey: credentialsNormalized.apiKey || existingCreds?.apiKey || '',
        apiSecret: credentialsNormalized.apiSecret || existingCreds?.apiSecret || '',
        token: credentialsNormalized.token || existingCreds?.token || '',
      };
    } else {
      merged = {
        ...existingCreds,
        baseUrl: credentialsNormalized.baseUrl || existingCreds?.baseUrl || '',
        consumerKey: credentialsNormalized.consumerKey || existingCreds?.consumerKey || '',
        consumerSecret: credentialsNormalized.consumerSecret || existingCreds?.consumerSecret || '',
      };
    }
    const updated = await storage.updateConnection((existing as any).id, {
      isActive,
      credentialsEnc: encryptMarketplaceCredentials(merged),
      credentialsHint: credentialsHint || (existing as any).credentialsHint || null,
      metadata: (metadata ?? (existing as any).metadata ?? null) as any,
    });
    return NextResponse.json({ connection: updated }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    const isDuplicate =
      typeof msg === 'string' &&
      (msg.toLowerCase().includes('zaten bir bağlantı var') ||
        msg.toLowerCase().includes('unique') ||
        msg.toLowerCase().includes('duplicate'));

    return NextResponse.json(
      {
        error: isDuplicate ? 'Bu isimle zaten bir bağlantı var' : 'Bağlantı oluşturulamadı',
        details: msg,
      },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}

