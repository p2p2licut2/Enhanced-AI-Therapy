'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { conversationService } from '../lib/services/conversation-service';

/**
 * Component pentru gestionarea sincronizării între sesiuni
 * și între utilizatori autentificați și neautentificați
 */
export default function SyncController() {
  const { data: session, status } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Efectuează sincronizarea conversațiilor din localStorage cu baza de date
  // atunci când un utilizator se autentifică
  useEffect(() => {
    const syncLocalConversations = async () => {
      // Verificăm dacă utilizatorul tocmai s-a autentificat
      if (status === 'authenticated' && session?.user?.id) {
        const localKey = 'syncedAfterLogin';
        const alreadySynced = sessionStorage.getItem(localKey);
        
        // Evităm sincronizarea repetată în aceeași sesiune
        if (alreadySynced) return;
        
        try {
          setIsSyncing(true);
          
          // Verificăm dacă există conversații în localStorage
          const savedConversations = localStorage.getItem('conversations');
          if (!savedConversations) {
            console.log('No local conversations to sync');
            return;
          }
          
          // Parsăm conversațiile din localStorage
          const localConversations = JSON.parse(savedConversations);
          
          // Verificăm dacă există conversații valide
          if (!Array.isArray(localConversations) || localConversations.length === 0) {
            console.log('No valid local conversations to sync');
            return;
          }
          
          console.log('Syncing local conversations to database:', localConversations.length);
          
          // Pentru fiecare conversație locală, o salvăm în baza de date
          for (const conversation of localConversations) {
            if (conversation.messages && conversation.messages.length > 0) {
              await conversationService.createConversation({
                title: conversation.title,
                therapistId: conversation.therapistId,
                messages: conversation.messages,
                isFavorite: conversation.isFavorite
              });
            }
          }
          
          // Marcăm ca sincronizat în sesiunea curentă
          sessionStorage.setItem(localKey, 'true');
          
          // Opțional, ștergem conversațiile din localStorage după sincronizare
          // localStorage.removeItem('conversations');
          
          console.log('Local conversations synced successfully');
        } catch (error) {
          console.error('Error syncing local conversations:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    
    syncLocalConversations();
  }, [status, session?.user?.id]);
  
  // Acest component nu renderează nimic, este doar pentru logica
  return null;
}