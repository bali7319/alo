import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { id } = await params;
  if (!id?.trim()) {
    return NextResponse.json({ error: 'Ürün id gerekli' }, { status: 400 });
  }

  let body: { price?: string | number | null; stock?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const price = body.price !== undefined
    ? (body.price === null || body.price === '' ? null : String(body.price))
    : undefined;
  const stock = body.stock !== undefined
    ? (body.stock === null || body.stock === '' ? null : Number(body.stock))
    : undefined;

  if (price !== undefined && price !== null && (Number.isNaN(Number(price)) || Number(price) < 0)) {
    return NextResponse.json({ error: 'Geçersiz fiyat' }, { status: 400 });
  }
  if (stock !== undefined && stock !== null && (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock))) {
    return NextResponse.json({ error: 'Geçersiz stok (negatif olmayan tam sayı)' }, { status: 400 });
  }

  if (price === undefined && stock === undefined) {
    return NextResponse.json({ error: 'price veya stock gerekli' }, { status: 400 });
  }

  try {
    const storage = getMarketplaceStorage();
    await storage.updateProduct(id, { price, stock });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    return NextResponse.json(
      { error: 'Güncelleme yapılamadı', details: msg },
      { status: 500 }
    );
  }
}
