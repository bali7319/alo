import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * API route'larında hata yönetimi için yardımcı fonksiyon
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error)

  // ApiError ise direkt döndür
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  // Prisma hataları
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message?: string }
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'Bu kayıt zaten mevcut.',
          code: 'DUPLICATE_ENTRY',
        },
        { status: 409 }
      )
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Kayıt bulunamadı.',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      )
    }

    // Foreign key constraint violation
    if (prismaError.code === 'P2003') {
      return NextResponse.json(
        {
          error: 'İlişkili kayıt bulunamadı.',
          code: 'FOREIGN_KEY_CONSTRAINT',
        },
        { status: 400 }
      )
    }
  }

  // Validation hataları
  if (error && typeof error === 'object' && 'issues' in error) {
    return NextResponse.json(
      {
        error: 'Geçersiz veri.',
        code: 'VALIDATION_ERROR',
        details: error,
      },
      { status: 400 }
    )
  }

  // Genel hata
  const errorMessage = error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.'
  
  return NextResponse.json(
    {
      error: process.env.NODE_ENV === 'production' 
        ? 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' 
        : errorMessage,
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  )
}

/**
 * API route'larında try-catch wrapper
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}
