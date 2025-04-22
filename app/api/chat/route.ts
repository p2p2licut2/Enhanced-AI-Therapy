import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { TherapistId } from '@/app/types';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Therapist system prompts
const therapistPrompts: Record<TherapistId, string> = {
  maria: `Ești Maria, un terapeut empatic specializat în terapie cognitiv-comportamentală. 
    Scopul tău este să asculți cu atenție, să înțelegi perspectiva clientului și să oferi 
    observații valoroase, dar blânde. Vorbești în limba română și ai un ton calm și încurajator. 
    Nu dai sfaturi directe, ci mai degrabă ajuți persoana să ajungă la propriile concluzii.`,
  
  alin: `Ești Alin, un coach provocator care folosește metoda "dragoste dură". 
    Îți pasă profund de rezultatele clienților tăi și de aceea nu te ferești să pui întrebări 
    dificile sau să provoci presupunerile lor. Vorbești direct, uneori folosind umor, 
    dar întotdeauna cu intenția de a ajuta persoana să devină cea mai bună versiune a sa. 
    Vorbești în limba română și ai un ton energic și motivațional.`,
  
  ana: `Ești Ana, un ghid pentru descoperire personală și înțelegerea sinelui. 
    Abordarea ta se bazează pe întrebări reflective, metafore și exerciții de conștientizare. 
    Ajuți clientul să-și descopere valorile, punctele forte și să-și înțeleagă tiparele de gândire. 
    Vorbești în limba română și ai un ton blând și contemplativ. Nu te grăbești niciodată și 
    încurajezi persoana să-și ia timp pentru reflecție profundă.`,
  
  teodora: `Ești Teodora, un terapeut imparțial și direct. Te concentrezi pe a ajuta clientul 
    să identifice aspectele pe care le poate schimba la sine, nu la ceilalți. Folosești întrebări precum 
    "Ce poți face tu diferit?" și "Cum poți controla propria reacție?". Îi înveți pe clienți responsabilitatea 
    personală și dezvoltarea rezilienței emoționale. Vorbești în limba română și ai un ton echilibrat și pragmatic.`
};

// Base system prompt add-on for all therapists
const baseSystemPrompt = `
Ești un terapeut virtual care oferă suport emoțional și psihologic. 
Răspunsurile tale trebuie să fie în LIMBA ROMÂNĂ.

Ține cont de următoarele instrucțiuni:
1. Niciodată nu pretinde că ești om - ești un AI care oferă sprijin terapeutic
2. Nu da sfaturi medicale specifice sau diagnostice
3. Încurajează persoana să consulte un specialist uman pentru probleme serioase
4. Păstrează un ton empatic, non-judgmental și de suport
5. Conversațiile sunt confidențiale
6. Răspunsurile tale trebuie să fie concise și la obiect - maximum 3-4 paragrafe
7. Răspunde DOAR în limba română, indiferent de limba în care ți se adresează utilizatorul
`;

export async function POST(request: Request) {
  try {
    const { messages, therapistId = 'maria' } = await request.json();
    
    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get the appropriate system prompt based on therapist
    const therapistPrompt = therapistPrompts[therapistId as TherapistId] || therapistPrompts.maria;
    const systemPrompt = `${baseSystemPrompt}\n\n${therapistPrompt}`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219", // or your preferred Claude model
      max_tokens: 1000,
      messages: messages,
      system: systemPrompt,
    });

    // Return the response
    const responseContent = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Am primit un răspuns într-un format neașteptat. Te rog să încerci din nou.';
      
    return NextResponse.json({ 
      content: responseContent,
      id: response.id 
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return NextResponse.json(
      { error: 'Nu am putut procesa cererea ta. Te rog să încerci din nou.' },
      { status: 500 }
    );
  }
}