import { Conversation, Message } from '@/app/types';

/**
 * Serviciu pentru gestionarea conversațiilor
 */
class ConversationService {
  /**
   * Obține toate conversațiile utilizatorului
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch('/api/conversations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Pentru utilizatorii neautentificați sau erori, returnăm un array gol
        console.error('Error fetching conversations:', response.statusText);
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  /**
   * Creează o nouă conversație
   */
  async createConversation(conversation: Partial<Conversation>): Promise<Conversation | null> {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversation),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create conversation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  /**
   * Obține o conversație după ID
   */
  async getConversation(id: string): Promise<Conversation | null> {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching conversation ${id}:`, error);
      return null;
    }
  }

  /**
   * Actualizează o conversație
   */
  async updateConversation(
    id: string, 
    updates: Partial<Conversation>,
    newMessages?: Message[]
  ): Promise<Conversation | null> {
    try {
      const updateData = { ...updates };
      
      if (newMessages && newMessages.length > 0) {
        updateData.newMessages = newMessages;
      }
      
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update conversation');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating conversation ${id}:`, error);
      return null;
    }
  }

  /**
   * Adaugă un mesaj la o conversație
   */
  async addMessage(conversationId: string, message: Message): Promise<Conversation | null> {
    return this.updateConversation(conversationId, {}, [message]);
  }

  /**
   * Șterge o conversație
   */
  async deleteConversation(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete conversation');
      }

      return true;
    } catch (error) {
      console.error(`Error deleting conversation ${id}:`, error);
      return false;
    }
  }

  /**
   * Actualizează favoritul unei conversații
   */
  async toggleFavorite(id: string, isFavorite: boolean): Promise<Conversation | null> {
    return this.updateConversation(id, { isFavorite });
  }

  /**
   * Redenumește o conversație
   */
  async renameConversation(id: string, title: string): Promise<Conversation | null> {
    return this.updateConversation(id, { title });
  }
}

// Instanță singleton a serviciului
export const conversationService = new ConversationService();