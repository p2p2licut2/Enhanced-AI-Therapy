// app/types/index.ts

/**
 * Valid therapist IDs in the application
 */
export type TherapistId = 'maria' | 'alin' | 'ana' | 'teodora';

/**
 * Therapist profile information
 */
export interface Therapist {
  id: TherapistId;
  name: string;
  title: string;
  description: string;
  avatarSrc: string;
  systemPrompt: string;
}

/**
 * Valid roles for chat messages
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Message in a conversation
 */
export interface Message {
  role: MessageRole;
  content: string;
  displayed?: boolean;
  timestamp?: number;
}

/**
 * Conversation between user and therapist
 */
export interface Conversation {
  id: string;
  title: string;
  therapistId: TherapistId;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
}

/**
 * Conversation without messages (for list displays)
 */
export type ConversationSummary = Omit<Conversation, 'messages'>;

/**
 * API request format for chat
 */
export interface ChatRequest {
  messages: Array<Pick<Message, 'role' | 'content'>>;
  therapistId: TherapistId;
}

/**
 * API response format for chat
 */
export interface ChatResponse {
  content: string;
  id: string;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  error: string;
  status?: number;
}

/**
 * Animation options for auto-scrolling
 */
export interface AutoScrollOptions {
  speed?: number;
  interval?: number;
  pauseAtEnd?: number;
}

/**
 * Event handlers for interactive elements
 */
export interface EventHandlers {
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}