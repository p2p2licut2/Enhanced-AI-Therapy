import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { TherapistId } from '@/app/types';

// Define error types
type ApiError = {
  status: number;
  message: string;
};

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

// Helper function to validate input and format error responses
function validateInput(data: any): { valid: true } | { valid: false, error: ApiError } {
  if (!data) {
    return {
      valid: false,
      error: {
        status: 400,
        message: 'Request body is required'
      }
    };
  }

  const { messages, therapistId } = data;

  if (!messages) {
    return {
      valid: false,
      error: {
        status: 400,
        message: 'Messages array is required'
      }
    };
  }

  if (!Array.isArray(messages)) {
    return {
      valid: false,
      error: {
        status: 400,
        message: 'Messages must be an array'
      }
    };
  }

  if (messages.length === 0) {
    return {
      valid: false,
      error: {
        status: 400,
        message: 'At least one message is required'
      }
    };
  }

  if (therapistId && !['maria', 'alin', 'ana', 'teodora'].includes(therapistId)) {
    return {
      valid: false,
      error: {
        status: 400,
        message: 'Invalid therapist ID'
      }
    };
  }

  return { valid: true };
}

// Create a rate limiter
const rateLimits = new Map<string, { count: number, timestamp: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 20; // 20 requests
  const window = 60 * 1000; // per minute
  
  const userRateLimit = rateLimits.get(ip) || { count: 0, timestamp: now };
  
  // Reset counter if outside the time window
  if (now - userRateLimit.timestamp > window) {
    userRateLimit.count = 1;
    userRateLimit.timestamp = now;
  } else {
    userRateLimit.count += 1;
  }
  
  rateLimits.set(ip, userRateLimit);
  
  return userRateLimit.count <= limit;
}

export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Check rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Prea multe cereri. Te rugăm să aștepți un minut.' },
      { status: 429 }
    );
  }

  try {
    // Parse request body
    const data = await request.json().catch(() => null);
    
    // Validate input
    const validation = validateInput(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: validation.error.status }
      );
    }

    const { messages, therapistId = 'maria' } = data;
    
    // Get the appropriate system prompt based on therapist
    const therapistPrompt = therapistPrompts[therapistId as TherapistId] || therapistPrompts.maria;
    const systemPrompt = `${baseSystemPrompt}\n\n${therapistPrompt}`;

    // Set up a timeout for the API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
    
    try {
      // Call Claude API
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // or your preferred Claude model
        max_tokens: 1000,
        messages: messages,
        system: systemPrompt,
      }, { signal: controller.signal });

      clearTimeout(timeoutId);

      // Return the response
      const responseContent = response.content[0].type === 'text' 
        ? response.content[0].text 
        : 'Am primit un răspuns într-un format neașteptat. Te rog să încerci din nou.';
        
      return NextResponse.json({ 
        content: responseContent,
        id: response.id 
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error; // Re-throw to be caught by outer catch block
    }
  } catch (error: any) {
    console.error('Error calling Claude API:', error);
    
    // Handle different error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Cererea a durat prea mult. Te rugăm să încerci din nou.' },
        { status: 504 }
      );
    }
    
    if (error.status === 429 || (error.error && error.error.type === 'rate_limit_exceeded')) {
      return NextResponse.json(
        { error: 'Serviciul este momentan ocupat. Te rugăm să încerci din nou după câteva momente.' },
        { status: 429 }
      );
    }
    
    if (error.status === 401 || error.status === 403) {
      console.error('API authentication error:', error);
      return NextResponse.json(
        { error: 'Eroare de autentificare API.' },
        { status: 500 }
      );
    }
    
    // Default error response
    return NextResponse.json(
      { error: 'Nu am putut procesa cererea ta. Te rog să încerci din nou.' },
      { status: 500 }
    );
  }
}