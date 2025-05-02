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
  journalEntryId?: string; // Reference to journal entry if conversation was started from journal
  explorationPointId?: string; // Reference to exploration point if conversation was started from point
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

/**
 * Journal template types
 */
export type JournalTemplateId = 'daily' | 'gratitude' | 'affirmation' | 'reflection';

/**
 * Journal template interface
 */
export interface JournalTemplate {
  id: JournalTemplateId;
  name: string;
  description: string;
  icon: string;
  prompts: string[];
  color: string;
}

/**
 * Exploration point interface - points extracted from journal entries for further exploration
 */
export interface ExplorationPoint {
  id: string;
  content: string;
  isExplored: boolean;
  conversationId?: string;
  summary?: string;
  createdAt: number;
}

/**
 * Journal entry interface
 */
export interface JournalEntry {
  id: string;
  templateId: JournalTemplateId;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  explorationPoints: ExplorationPoint[];
  isAnalyzed: boolean;
}

/**
 * API request for analyzing a journal entry
 */
export interface AnalyzeJournalRequest {
  journalEntryId: string;
  content: string;
  templateId: JournalTemplateId;
}

/**
 * API response for journal analysis
 */
export interface AnalyzeJournalResponse {
  explorationPoints: Omit<ExplorationPoint, 'id' | 'createdAt'>[];
}

/**
 * API request for summarizing a conversation from exploration point
 */
export interface SummarizeConversationRequest {
  conversationId: string;
  journalEntryId: string;
  explorationPointId: string;
}

/**
 * API response for conversation summary
 */
export interface SummarizeConversationResponse {
  summary: string;
}