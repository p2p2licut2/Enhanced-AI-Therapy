// app/components/ConversationItem.tsx
'use client';

import { Conversation } from '@/app/types';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: (id: string) => void;
}

export default function ConversationItem({ conversation, onClick }: ConversationItemProps) {
  // Format date to readable string
  const formatDate = (timestamp: number): string => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true,
      locale: ro
    });
  };

  return (
    <div 
      className="conversation-item"
      onClick={() => onClick(conversation.id)}
    >
      <div>
        <div className="conversation-item-title">{conversation.title}</div>
        <div className="conversation-item-date">{formatDate(conversation.updatedAt)}</div>
      </div>
      
      {conversation.isFavorite && (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-4 h-4 text-yellow-500"
        >
          <path 
            fillRule="evenodd" 
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" 
            clipRule="evenodd" 
          />
        </svg>
      )}
    </div>
  );
}