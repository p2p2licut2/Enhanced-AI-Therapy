// app/utils/helpers.ts
import { Message, Conversation } from '@/app/types';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import React from 'react';

/**
 * Generate a conversation title based on the first user message
 */
export const generateConversationTitle = (firstUserMessage: string): string => {
  if (!firstUserMessage) return 'Conversație nouă';
  
  // Use the first 4-5 words or up to 30 chars
  const words = firstUserMessage.split(' ');
  const titleWords = words.slice(0, Math.min(5, words.length));
  let title = titleWords.join(' ');
  
  if (title.length > 30) {
    title = title.substring(0, 27) + '...';
  }
  
  return title;
};

/**
 * Format a timestamp into a relative time string (e.g. "2 hours ago")
 */
export const formatRelativeTime = (timestamp: number): string => {
  return formatDistanceToNow(new Date(timestamp), { 
    addSuffix: true,
    locale: ro
  });
};

/**
 * Format a message with proper line breaks for rendering
 */
export const formatMessageContent = (content: string): React.ReactNode[] => {
  return content.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ));
};

/**
 * Sort conversations by date (most recent first)
 */
export const sortConversationsByDate = (conversations: Conversation[]): Conversation[] => {
  return [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
};

/**
 * Filter conversations by favorite status
 */
export const filterFavoriteConversations = (conversations: Conversation[]): Conversation[] => {
  return conversations.filter(c => c.isFavorite);
};

/**
 * Get recent conversations (limited to a specific count)
 */
export const getRecentConversations = (
  conversations: Conversation[], 
  limit: number = 10
): Conversation[] => {
  return sortConversationsByDate(conversations).slice(0, limit);
};