import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/lib/db';
import { AuditService } from '@/app/lib/services/audit-service';

// GET: Obținerea detaliilor unei conversații
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = params;
    
    // Verificăm dacă conversația aparține utilizatorului
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id,
        userId 
      },
      include: { messages: true },
    });
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

// PUT: Actualizarea unei conversații (inclusiv adăugarea de mesaje)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = params;
    const data = await request.json();
    
    // Verificăm dacă conversația aparține utilizatorului
    const existingConversation = await prisma.conversation.findFirst({
      where: { 
        id,
        userId 
      },
    });
    
    if (!existingConversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }
    
    // Pregătim datele pentru actualizare
    const updateData: any = {};
    
    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    
    if (data.isFavorite !== undefined) {
      updateData.isFavorite = data.isFavorite;
    }
    
    // Actualizăm întotdeauna timestamp-ul
    updateData.updatedAt = new Date();
    
    // Actualizăm conversația
    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: updateData,
    });
    
    // Adăugăm mesaje noi dacă există
    if (data.newMessages && data.newMessages.length > 0) {
      await prisma.message.createMany({
        data: data.newMessages.map((message: any) => ({
          conversationId: id,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp || new Date(),
        })),
      });
    }
    
    // Obținem conversația actualizată cu toate mesajele
    const fullConversation = await prisma.conversation.findUnique({
      where: { id },
      include: { messages: true },
    });
    
    // Logăm acțiunea
    await AuditService.log({
      userId,
      action: 'CONVERSATION_UPDATED',
      details: `Conversation ID: ${id}`,
    });
    
    return NextResponse.json(fullConversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

// DELETE: Ștergerea unei conversații
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = params;
    
    // Verificăm dacă conversația aparține utilizatorului
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id,
        userId 
      },
    });
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }
    
    // Ștergem conversația și toate mesajele asociate (prin cascadă)
    await prisma.conversation.delete({
      where: { id },
    });
    
    // Logăm acțiunea
    await AuditService.log({
      userId,
      action: 'CONVERSATION_DELETED',
      details: `Conversation ID: ${id}`,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}