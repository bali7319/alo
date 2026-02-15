import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getNobetciEczaneKaynakForCron,
  getTodayTurkeyYYYYMMDD,
} from '@/lib/nobetci-eczane'

const DEFAULT_CRON_SECRET = 'your-secret-key-here'

export async function GET(request: NextRequest) {
  try {
    const CRON_SECRET = process.env.CRON_SECRET || DEFAULT_CRON_SECRET
    const isProduction = process.env.NODE_ENV === 'production'

    if (isProduction && (!CRON_SECRET || CRON_SECRET === DEFAULT_CRON_SECRET)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authHeader = request.headers.get('authorization')
    const cronSecret = request.nextUrl.searchParams.get('secret')
    const vercelCron = request.headers.get('x-vercel-cron')

    const allowed =
      vercelCron === '1' ||
      authHeader === `Bearer ${CRON_SECRET}` ||
      cronSecret === CRON_SECRET

    if (!allowed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validForDate = getTodayTurkeyYYYYMMDD()

    // Bugüne ait eski kayıtları sil
    await prisma.nobetciEczaneRecord.deleteMany({
      where: { validForDate },
    })

    const kaynak = getNobetciEczaneKaynakForCron()
    if (kaynak.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Kaynak liste boş, güncelleme atlandı.',
        validForDate,
        insertedCount: 0,
        timestamp: new Date().toISOString(),
      })
    }

    await prisma.nobetciEczaneRecord.createMany({
      data: kaynak.map((e) => ({
        name: e.name,
        address: e.address,
        phone: e.phone,
        mapQuery: e.mapQuery,
        ilceSlug: e.ilceSlug,
        validForDate,
      })),
    })

    return NextResponse.json({
      success: true,
      message: `${kaynak.length} nöbetçi eczane kaydı güncellendi.`,
      validForDate,
      insertedCount: kaynak.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Nöbetçi eczane cron hatası:', error)
    return NextResponse.json(
      {
        error: 'Nöbetçi eczane cron çalıştırılırken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
