export type TherapistId = 'maria' | 'alin' | 'ana' | 'teodora';

export interface Therapist {
  id: TherapistId;
  name: string;
  title: string;
  description: string;
  avatarSrc: string;
  systemPrompt: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  displayed?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  therapistId: TherapistId;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
}