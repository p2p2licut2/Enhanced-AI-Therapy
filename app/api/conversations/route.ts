import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/lib/db';
import { AuditService } from '@/app/lib/services/audit-service';

// GET: Încărcarea conversațiilor pentru utilizatorul autentificat
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Obținem conversațiile utilizatorului din baza de date
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: { messages: true },
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST: Crearea unei noi conversații
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const data = await request.json();
    
    // Validare date
    if (!data.title || !data.therapistId) {
      return NextResponse.json(
        { error: 'Title and therapistId are required' },
        { status: 400 }
      );
    }
    
    // Creăm conversația în baza de date
    const conversation = await prisma.conversation.create({
      data: {
        title: data.title,
        therapistId: data.therapistId,
        userId,
        isFavorite: data.isFavorite || false,
        // Creăm și mesajele inițiale dacă există
        messages: data.messages?.length > 0 ? {
          create: data.messages.map((message: any) => ({
            role: message.role,
            content: message.content,
            timestamp: message.timestamp || new Date(),
          }))
        } : undefined,
      },
      include: { messages: true },
    });
    
    // Logăm acțiunea
    await AuditService.log({
      userId,
      action: 'CONVERSATION_CREATED',
      details: `Conversation ID: ${conversation.id}`,
    });
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}