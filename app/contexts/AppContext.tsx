'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Therapist, TherapistId, Conversation, Message } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Define therapists data
const therapists: Record<TherapistId, Therapist> = {
  // ... codul existent pentru therapists ...
  maria: {
    id: 'maria',
    name: 'Maria',
    title: 'terapeutul tău',
    description: 'Terapeutul tău zilnic, ascultă și îndrumă',
    avatarSrc: '/maria-avatar.png',
    systemPrompt: `Ești Maria, un terapeut empatic specializat în terapie cognitiv-comportamentală. 
    Scopul tău este să asculți cu atenție, să înțelegi perspectiva clientului și să oferi 
    observații valoroase, dar blânde. Vorbești în limba română și ai un ton calm și încurajator. 
    Nu dai sfaturi directe, ci mai degrabă ajuți persoana să ajungă la propriile concluzii.`
  },
  alin: {
    id: 'alin',
    name: 'Alin',
    title: 'coach provocator',
    description: 'Dragoste dură cu intenții pozitive',
    avatarSrc: '/alin-avatar.png',
    systemPrompt: `Ești Alin, un coach provocator care folosește metoda "dragoste dură". 
    Îți pasă profund de rezultatele clienților tăi și de aceea nu te ferești să pui întrebări 
    dificile sau să provoci presupunerile lor. Vorbești direct, uneori folosind umor, 
    dar întotdeauna cu intenția de a ajuta persoana să devină cea mai bună versiune a sa. 
    Vorbești în limba română și ai un ton energic și motivațional.`
  },
  ana: {
    id: 'ana',
    name: 'Ana',
    title: 'descoperire personală',
    description: 'Înțelegerea sinelui',
    avatarSrc: '/ana-avatar.png',
    systemPrompt: `Ești Ana, un ghid pentru descoperire personală și înțelegerea sinelui. 
    Abordarea ta se bazează pe întrebări reflective, metafore și exerciții de conștientizare. 
    Ajuți clientul să-și descopere valorile, punctele forte și să-și înțeleagă tiparele de gândire. 
    Vorbești în limba română și ai un ton blând și contemplativ. Nu te grăbești niciodată și 
    încurajezi persoana să-și ia timp pentru reflecție profundă.`
  },
  teodora: {
    id: 'teodora',
    name: 'Teodora',
    title: 'terapeut imparțial',
    description: 'Te ajută să te schimbi pe tine, nu pe ceilalți',
    avatarSrc: '/teodora-avatar.png',
    systemPrompt: `Ești Teodora, un terapeut imparțial și direct. Te concentrezi pe a ajuta clientul 
    să identifice aspectele pe care le poate schimba la sine, nu la ceilalți. Folosești întrebări precum 
    "Ce poți face tu diferit?" și "Cum poți controla propria reacție?". Îi înveți pe clienți responsabilitatea 
    personală și dezvoltarea rezilienței emoționale. Vorbești în limba română și ai un ton echilibrat și pragmatic.`
  }
};

// Generate a random title based on user's first message
const generateConversationTitle = (firstUserMessage: string): string => {
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

// Define context type
interface AppContextType {
  currentTherapist: Therapist;
  setCurrentTherapist: (therapistId: TherapistId) => void;
  currentConversation: Conversation | null;
  conversations: Conversation[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (message: Message) => void;
  createNewConversation: (therapistId: TherapistId) => void;
  loadConversation: (conversationId: string) => void;
  toggleFavorite: (conversationId: string) => void;
  isCurrentConversationFavorite: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  isTherapistSelectorOpen: boolean;
  setIsTherapistSelectorOpen: (isOpen: boolean) => void;
  favoriteConversations: Conversation[];
  recentConversations: Conversation[];
  renameConversation: (conversationId: string, newTitle: string) => void;
  deleteConversation: (conversationId: string) => void;
}

// Create context with default values
const AppContext = createContext<AppContextType>({} as AppContextType);

// Custom hook to use the context
export const useApp = () => useContext(AppContext);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTherapistId, setCurrentTherapistId] = useState<TherapistId>('maria');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTherapistSelectorOpen, setIsTherapistSelectorOpen] = useState(false);

  // Load conversations from localStorage on initial load
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
    
    // Check if there was a current conversation
    const savedCurrentConversationId = localStorage.getItem('currentConversationId');
    if (savedCurrentConversationId) {
      setCurrentConversationId(savedCurrentConversationId);
    }
  }, []);

  // Update localStorage when conversations change
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Update localStorage when current conversation changes
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('currentConversationId', currentConversationId);
    } else {
      localStorage.removeItem('currentConversationId');
    }
  }, [currentConversationId]);

  // Load messages when current conversation changes
  useEffect(() => {
    if (currentConversationId) {
      const conversation = conversations.find(c => c.id === currentConversationId);
      if (conversation) {
        setMessages(conversation.messages);
        setCurrentTherapistId(conversation.therapistId);
      }
    } else {
      setMessages([]);
    }
  }, [currentConversationId, conversations]);

  // Get current therapist
  const currentTherapist = therapists[currentTherapistId];
  
  // Get current conversation
  const currentConversation = currentConversationId
    ? conversations.find(c => c.id === currentConversationId) || null
    : null;
    
  // Derived state for favorites and recent conversations
  const favoriteConversations = conversations
    .filter(c => c.isFavorite)
    .sort((a, b) => b.updatedAt - a.updatedAt);
    
  const recentConversations = conversations
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 10);
    
  // Check if current conversation is a favorite
  const isCurrentConversationFavorite = 
    currentConversationId ? 
    Boolean(currentConversation?.isFavorite) : 
    false;

  // Change current therapist
  const setCurrentTherapist = (therapistId: TherapistId) => {
    setCurrentTherapistId(therapistId);
  };

  // Add a message to the current conversation
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // If this is a new conversation (no ID yet), create it
    if (!currentConversationId && message.role === 'user') {
      const newConversation: Conversation = {
        id: uuidv4(),
        title: generateConversationTitle(message.content),
        therapistId: currentTherapistId,
        messages: [message],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isFavorite: false
      };
      
      setConversations(prev => [...prev, newConversation]);
      setCurrentConversationId(newConversation.id);
    } 
    // Otherwise update the existing conversation
    else if (currentConversationId) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId
            ? { 
                ...conv, 
                messages: [...conv.messages, message],
                updatedAt: Date.now()
              }
            : conv
        )
      );
    }
  };

  // Create a new conversation
  const createNewConversation = (therapistId: TherapistId) => {
    // 1. generează un ID nou
    const convId = uuidv4();
  
    // 2. adaugă conversaţia încă FĂRĂ mesaje
    const newConversation: Conversation = {
      id: convId,
      title: 'Începe conversatia...',      // placeholder până la primul mesaj
      therapistId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isFavorite: false,
    };
  
    setConversations(prev => [...prev, newConversation]);
  
    // 3. setează contextul
    setCurrentTherapistId(therapistId);
    setCurrentConversationId(convId);
    setMessages([]);                  // fereastra de chat e goală
    setIsMenuOpen(false);
    setIsTherapistSelectorOpen(false);
  };

  // Load an existing conversation
  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setCurrentTherapistId(conversation.therapistId);
      setIsMenuOpen(false);
    }
  };

  // Toggle favorite status for a conversation
  const toggleFavorite = (conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId
          ? { ...conv, isFavorite: !conv.isFavorite }
          : conv
      )
    );
  };
  
  // Rename a conversation
  const renameConversation = (conversationId: string, newTitle: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId
          ? { ...conv, title: newTitle, updatedAt: Date.now() }
          : conv
      )
    );
  };
  
  // Delete a conversation
  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    // If we're deleting the current conversation, clear it
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentTherapist,
        setCurrentTherapist,
        currentConversation,
        conversations,
        messages,
        setMessages,
        addMessage,
        createNewConversation,
        loadConversation,
        toggleFavorite,
        isCurrentConversationFavorite,
        isMenuOpen,
        setIsMenuOpen,
        isTherapistSelectorOpen,
        setIsTherapistSelectorOpen,
        favoriteConversations,
        recentConversations,
        renameConversation,
        deleteConversation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};