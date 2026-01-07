import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Basit health check
export async function GET() {
  try {
    // Veritabanı bağlantısını test et
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'alo17',
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'alo17',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}

