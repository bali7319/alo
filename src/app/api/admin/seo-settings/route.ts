import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';
import { getSeoSettings, setSeoSettings } from '@/lib/seo-settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    const settings = await getSeoSettings();
    return NextResponse.json(settings, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
    }

    const patch = {
      internalLinking: typeof body?.internalLinking === 'boolean' ? body.internalLinking : undefined,
      linkTracking: typeof body?.linkTracking === 'boolean' ? body.linkTracking : undefined,
    };

    const next = await setSeoSettings(patch);
    return NextResponse.json(next, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return handleApiError(error);
  }
}

