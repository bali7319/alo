import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Kullanıcının tüm mesajlarını getir
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('GET /api/messages error:', error);
    return NextResponse.json(
      { error: 'Mesajlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/messages - Starting...');
    
    const session = await getServerSession();
    console.log('Session:', session ? 'Found' : 'Not found');
    
    if (!session?.user?.email) {
      console.log('Unauthorized - No session or email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    console.log('User found:', user ? `ID: ${user.id}` : 'Not found');

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { receiverId, listingId, content } = body;

    if (!content?.trim()) {
      console.log('Validation error: No content');
      return NextResponse.json({ error: 'Mesaj içeriği gerekli' }, { status: 400 });
    }

    if (!receiverId) {
      console.log('Validation error: No receiverId');
      return NextResponse.json({ error: 'Alıcı ID gerekli' }, { status: 400 });
    }

    // Alıcının var olup olmadığını kontrol et
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      console.log('Receiver not found:', receiverId);
      return NextResponse.json({ error: 'Alıcı bulunamadı' }, { status: 404 });
    }

    console.log('Creating message...');
    console.log('Sender ID:', user.id);
    console.log('Receiver ID:', receiverId);
    console.log('Content:', content);

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: user.id,
        receiverId: receiverId,
        listingId: listingId || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    });

    console.log('Message created successfully:', message.id);

    return NextResponse.json({ 
      message: 'Mesaj başarıyla gönderildi',
      data: message 
    });
  } catch (error) {
    console.error('POST /api/messages error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { 
        error: 'Mesaj gönderilirken hata oluştu',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 