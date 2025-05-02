// app/api/journal/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SummarizeConversationRequest, SummarizeConversationResponse } from '@/app/types';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// System prompt for summarization
const systemPrompt = `
Ești un asistent specializat în rezumarea conversațiilor terapeutice. Sarcina ta este să creezi un rezumat scurt 
al conversației dintre utilizator și terapeut, focalizat pe un punct specific din jurnalul utilizatorului.

Rezumatul trebuie să:
1. Fie concis (maximum 2-3 propoziții)
2. Capteze esența conversației și orice insight sau concluzie importantă
3. Fie formulat din perspectiva utilizatorului (folosind "Am descoperit că...", "Am înțeles că...", etc.)
4. Evite jargonul psihologic și să folosească un limbaj accesibil
5. Mențină un ton pozitiv și orientat spre soluții

IMPORTANT: Răspunde DOAR cu rezumatul, fără text introductiv sau explicații suplimentare.
`;

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const data: SummarizeConversationRequest = await request.json();
    
    if (!data || !data.conversationId || !data.journalEntryId || !data.explorationPointId) {
      return NextResponse.json(
        { error: 'Toate câmpurile sunt necesare' },
        { status: 400 }
      );
    }

    // Get conversation history from localStorage
    // In a real application, you'd get this from a database
    // For now, we need to use the global.localStorage mock for SSR
    let conversations;
    try {
      const storage = globalThis.localStorage;
      const conversationsJSON = storage?.getItem('conversations');
      if (conversationsJSON) {
        conversations = JSON.parse(conversationsJSON);
      } else {
        throw new Error('Conversațiile nu au fost găsite');
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Nu am putut accesa conversațiile' },
        { status: 500 }
      );
    }
    
    // Find the specific conversation
    const conversation = conversations.find(
      (c: any) => c.id === data.conversationId && 
                 c.journalEntryId === data.journalEntryId && 
                 c.explorationPointId === data.explorationPointId
    );
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversația specificată nu a fost găsită' },
        { status: 404 }
      );
    }
    
    // Get journals to find the specific exploration point
    let journals;
    try {
      const storage = globalThis.localStorage;
      const journalsJSON = storage?.getItem('journals');
      if (journalsJSON) {
        journals = JSON.parse(journalsJSON);
      } else {
        throw new Error('Jurnalele nu au fost găsite');
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Nu am putut accesa jurnalele' },
        { status: 500 }
      );
    }
    
    // Find the journal and exploration point
    const journal = journals.find((j: any) => j.id === data.journalEntryId);
    
    if (!journal) {
      return NextResponse.json(
        { error: 'Jurnalul specificat nu a fost găsit' },
        { status: 404 }
      );
    }
    
    const explorationPoint = journal.explorationPoints.find(
      (p: any) => p.id === data.explorationPointId
    );
    
    if (!explorationPoint) {
      return NextResponse.json(
        { error: 'Punctul de explorare specificat nu a fost găsit' },
        { status: 404 }
      );
    }
    
    // Format the conversation for the API
    const messages = conversation.messages.slice(0, 6); // Limit to first 6 messages for efficiency
    
    const userMessages = messages
      .filter((m: any) => m.role === 'user')
      .map((m: any) => m.content)
      .join('\n\n');
      
    const therapistMessages = messages
      .filter((m: any) => m.role === 'assistant')
      .map((m: any) => m.content)
      .join('\n\n');
      
    // Create the prompt
    const userPrompt = `
Punctul de explorare din jurnal: "${explorationPoint.content}"

Conversația cu terapeutul a inclus următoarele mesaje:

Utilizator:
${userMessages}

Terapeut:
${therapistMessages}

Te rog să creezi un rezumat concis al conversației, focalizat pe ce a învățat sau a înțeles utilizatorul despre acest punct de explorare.
`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ],
      system: systemPrompt,
    });

    // Extract content from response
    const content = response.content[0].type === 'text' 
      ? response.content[0].text.trim()
      : 'Am discutat despre acest subiect și am obținut perspective noi.';
    
    // Return the summary
    return NextResponse.json({ 
      summary: content 
    } as SummarizeConversationResponse);

  } catch (error: any) {
    console.error('Error creating summary:', error);
    
    return NextResponse.json(
      { error: 'Nu am putut crea rezumatul. Te rugăm să încerci din nou.' },
      { status: 500 }
    );
  }
}