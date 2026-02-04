import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { encryptMarketplaceCredentials } from '@/lib/marketplaces/credentials';
import { getMarketplaceStorage } from '@/lib/marketplaces/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

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

const UpdateSchema = z.object({
  name: z.string().trim().min(2).max(64).optional(),
  isActive: z.boolean().optional(),
  credentials: z.unknown().optional(),
  credentialsHint: z.string().trim().max(200).optional().nullable(),
  metadata: z.unknown().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { id } = await params;
  const storage = getMarketplaceStorage();
  const connection = await storage.getConnection(id);

  if (!connection) return NextResponse.json({ error: 'Bağlantı bulunamadı' }, { status: 404 });
  return NextResponse.json({ connection });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz istek', details: parsed.error.flatten() }, { status: 400 });
  }

  const data: any = {};
  if (typeof parsed.data.name === 'string') data.name = parsed.data.name;
  if (typeof parsed.data.isActive === 'boolean') data.isActive = parsed.data.isActive;
  if (typeof parsed.data.credentialsHint !== 'undefined') data.credentialsHint = parsed.data.credentialsHint;
  if (typeof parsed.data.metadata !== 'undefined') data.metadata = parsed.data.metadata as any;
  if (typeof parsed.data.credentials !== 'undefined') data.credentialsEnc = encryptMarketplaceCredentials(parsed.data.credentials);

  const storage = getMarketplaceStorage();
  const updated = await storage.updateConnection(id, data);

  return NextResponse.json({ connection: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { id } = await params;
  const storage = getMarketplaceStorage();
  await storage.deleteConnection(id);
  return NextResponse.json({ ok: true });
}

