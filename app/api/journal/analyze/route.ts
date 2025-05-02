// app/api/journal/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AnalyzeJournalRequest, AnalyzeJournalResponse, JournalTemplateId } from '@/app/types';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Template-specific system prompts
const templatePrompts: Record<JournalTemplateId, string> = {
  daily: `Analizează acest jurnal zilnic și identifică 3-5 aspecte importante care ar putea beneficia de explorare terapeutică. 
    Aspectele identificate trebuie să fie relevante pentru sănătatea mintală și dezvoltarea personală a utilizatorului. 
    Concentrează-te pe emoții, gânduri, comportamente și relații care par semnificative.`,
  
  gratitude: `Analizează acest jurnal de recunoștință și identifică 3-5 aspecte importante care ar putea beneficia de explorare terapeutică. 
    Chiar dacă jurnalul se concentrează pe recunoștință și aspecte pozitive, caută teme subiacente, 
    oportunități de creștere sau domenii în care persoana ar putea aprofunda practica recunoștinței.`,
  
  affirmation: `Analizează acest jurnal de afirmații și identifică 3-5 aspecte importante care ar putea beneficia de explorare terapeutică. 
    Caută temele din spatele afirmațiilor, domeniile în care persoana dorește să se dezvolte, 
    sau posibile blocaje emoționale care sunt abordate prin afirmații.`,
  
  reflection: `Analizează acest jurnal de reflecție și identifică 3-5 aspecte importante care ar putea beneficia de explorare terapeutică. 
    Concentrează-te pe pattern-urile de comportament identificate, lecțiile învățate, 
    și domeniile în care persoana ar putea beneficia de o explorare mai profundă.`
};

// Base system prompt for all templates
const baseSystemPrompt = `
Ești un asistent specializat în analiză terapeutică de jurnale. Sarcina ta este să identifici aspecte importante 
din jurnalul utilizatorului care ar putea beneficia de explorare terapeutică.

Răspunsul tău trebuie să fie în format JSON, conținând un array numit "explorationPoints". 
Fiecare punct de explorare trebuie să aibă următoarea structură:
{
  "content": "Descrierea punctului de explorare, formulată într-un mod care să încurajeze reflecția",
  "isExplored": false
}

Indicații pentru generarea punctelor de explorare:
1. Identifică teme emoționale cheie (ex. anxietate, frustrare, bucurie, incertitudine)
2. Identifică pattern-uri cognitive sau comportamentale
3. Identifică relații sau interacțiuni sociale semnificative
4. Formulează fiecare punct ca o observație sau întrebare care invită la reflecție
5. Fii specific și folosește limbajul utilizatorului unde este posibil
6. Menține un ton empatic și non-judgmental

IMPORTANT: Răspunde DOAR cu obiectul JSON, fără text introductiv sau explicații.
`;

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const data: AnalyzeJournalRequest = await request.json();
    
    if (!data || !data.content || !data.templateId) {
      return NextResponse.json(
        { error: 'Content și templateId sunt necesare' },
        { status: 400 }
      );
    }

    // Get template-specific prompt
    const templatePrompt = templatePrompts[data.templateId] || templatePrompts.daily;
    
    // Combine prompts
    const systemPrompt = `${baseSystemPrompt}\n\n${templatePrompt}`;
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Iată jurnalul utilizatorului pentru analiză:\n\n${data.content}`
        }
      ],
      system: systemPrompt,
    });

    // Extract content from response
    const content = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Nu am putut procesa jurnalul.';
    
    // Parse JSON from response
    try {
      // Find the JSON part in the response 
      // Claude might sometimes include some text before or after the JSON
      const jsonMatch = content.match(/(\{|\[)(.|\n)*?(\}|\])/);
      
      if (!jsonMatch) {
        throw new Error('Nu am putut identifica un răspuns JSON valid');
      }
      
      const jsonContent = jsonMatch[0];
      const parsedResponse = JSON.parse(jsonContent);
      
      // Ensure we have the expected structure
      if (!parsedResponse.explorationPoints || !Array.isArray(parsedResponse.explorationPoints)) {
        throw new Error('Răspunsul nu conține un array de puncte de explorare');
      }
      
      // Return the exploration points
      return NextResponse.json({ 
        explorationPoints: parsedResponse.explorationPoints 
      } as AnalyzeJournalResponse);
      
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      
      // Fallback: Generate generic exploration points
      const fallbackPoints = [
        {
          content: "Cum te-ai simțit scriind acest jurnal și ce emoții predomină în reflecțiile tale?",
          isExplored: false
        },
        {
          content: "Ce pattern-uri observi în gândurile și comportamentele descrise în jurnal?",
          isExplored: false
        },
        {
          content: "Ce aspecte din acest jurnal ai dori să explorezi mai profund cu un terapeut?",
          isExplored: false
        }
      ];
      
      return NextResponse.json({ 
        explorationPoints: fallbackPoints 
      } as AnalyzeJournalResponse);
    }

  } catch (error: any) {
    console.error('Error analyzing journal:', error);
    
    return NextResponse.json(
      { error: 'Nu am putut analiza jurnalul. Te rugăm să încerci din nou.' },
      { status: 500 }
    );
  }
}