'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Therapist, TherapistId, Conversation, Message } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import { conversationService } from '../lib/services/conversation-service';

// Define therapists data
const therapists: Record<TherapistId, Therapist> = {
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
  pendingConversationTitle: string | null;
  showWelcomePage: boolean;
  setShowWelcomePage: (show: boolean) => void;
}

// Create context with default values
const AppContext = createContext<AppContextType>({} as AppContextType);

// Custom hook to use the context
export const useApp = () => useContext(AppContext);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [currentTherapistId, setCurrentTherapistId] = useState<TherapistId>('maria');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTherapistSelectorOpen, setIsTherapistSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Welcome page state
  const [showWelcomePage, setShowWelcomePage] = useState<boolean>(true);
  // Titlul pentru conversația neîncepută încă
  const [pendingConversationTitle, setPendingConversationTitle] = useState<string | null>('Începe conversația...');

  // Încarcă conversațiile pentru utilizatorul autentificat
  useEffect(() => {
    const loadUserConversations = async () => {
      if (isAuthenticated && session?.user?.id) {
        try {
          setIsLoading(true);
          console.log('Loading conversations from API for user:', session.user.id);
          const userConversations = await conversationService.getConversations();
          
          console.log('Loaded conversations:', userConversations.length);
          setConversations(userConversations);
        } catch (error) {
          console.error('Error loading user conversations:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (status === 'unauthenticated') {
        // Pentru utilizatorii neautentificați, încercăm să încărcăm din localStorage
        const loadLocalConversations = () => {
          try {
            console.log('Loading conversations from localStorage for unauthenticated user');
            const savedConversations = localStorage.getItem('conversations');
            if (savedConversations) {
              // Încărcăm doar conversațiile care au cel puțin un mesaj
              const parsedConversations = JSON.parse(savedConversations);
              const validConversations = parsedConversations.filter(
                (conv: Conversation) => conv.messages && conv.messages.length > 0
              );
              
              // Dacă am eliminat conversații, actualizăm localStorage
              if (validConversations.length !== parsedConversations.length) {
                localStorage.setItem('conversations', JSON.stringify(validConversations));
              }
              
              console.log('Loaded conversations from localStorage:', validConversations.length);
              setConversations(validConversations);
            }
          } catch (error) {
            console.error('Error loading conversations from localStorage:', error);
          } finally {
            setIsLoading(false);
          }
        };
        
        loadLocalConversations();
      }
    };
    
    loadUserConversations();
  }, [isAuthenticated, session?.user?.id, status]);

  // Încarcă conversația curentă din localStorage sau ultima conversație
  useEffect(() => {
    if (isLoading) return;
    
    // Verifică dacă există un ID de conversație salvat
    const savedCurrentConversationId = localStorage.getItem('currentConversationId');
    
    if (savedCurrentConversationId) {
      // Verifică dacă conversația există în lista încărcată
      const conversationExists = conversations.some(conv => conv.id === savedCurrentConversationId);
      if (conversationExists) {
        setCurrentConversationId(savedCurrentConversationId);
      } else if (conversations.length > 0) {
        // Dacă nu există, setează prima conversație din listă
        setCurrentConversationId(conversations[0].id);
      } else {
        // Dacă nu există conversații, setează null
        setCurrentConversationId(null);
      }
    } else if (conversations.length > 0) {
      // Dacă nu există un ID salvat, setează prima conversație din listă
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, isLoading]);

  // Check if we should show the welcome page based on user preference
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    // Only show welcome page if user hasn't seen it, or we're in a completely new session
    if (hasSeenWelcome === 'true' && currentConversationId) {
      setShowWelcomePage(false);
    } else {
      setShowWelcomePage(true);
    }
  }, [currentConversationId]);

  // Save welcome page state when it changes
  useEffect(() => {
    if (!showWelcomePage) {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [showWelcomePage]);

  // Update localStorage when current conversation changes
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('currentConversationId', currentConversationId);
      // Când avem o conversație curentă, nu avem nevoie de titlu în așteptare
      setPendingConversationTitle(null);
    } else {
      localStorage.removeItem('currentConversationId');
      // Resetăm titlul în așteptare când nu mai avem conversație curentă
      setPendingConversationTitle('Începe conversația...');
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

  // Salvăm conversațiile în localStorage pentru utilizatorii neautentificați
  useEffect(() => {
    if (status === 'unauthenticated' && conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations, status]);

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
  const addMessage = async (message: Message) => {
    // Actualizăm mesajele în starea locală
    setMessages(prev => [...prev, message]);
    
    // Dacă nu există o conversație curentă și mesajul este de la utilizator
    if (!currentConversationId && message.role === 'user') {
      const title = generateConversationTitle(message.content);
      
      // Creăm o nouă conversație
      const newConversation: Conversation = {
        id: uuidv4(), // ID temporar, va fi înlocuit de serverul API pentru utilizatorii autentificați
        title: title,
        therapistId: currentTherapistId,
        messages: [message],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isFavorite: false
      };
      
      if (isAuthenticated) {
        try {
          // Pentru utilizatorii autentificați, salvăm în baza de date
          console.log('Creating new conversation in database');
          
          const savedConversation = await conversationService.createConversation({
            title: title,
            therapistId: currentTherapistId,
            messages: [message],
            isFavorite: false
          });
          
          if (savedConversation) {
            console.log('Conversation created in database:', savedConversation.id);
            
            // Actualizăm starea cu conversația salvată (care include ID-ul generat de server)
            setConversations(prev => [...prev, savedConversation]);
            setCurrentConversationId(savedConversation.id);
          } else {
            // Fallback la localStorage dacă API call-ul eșuează
            console.log('Falling back to local state for new conversation');
            setConversations(prev => [...prev, newConversation]);
            setCurrentConversationId(newConversation.id);
          }
        } catch (error) {
          console.error('Error creating conversation in database:', error);
          // Fallback la localStorage
          setConversations(prev => [...prev, newConversation]);
          setCurrentConversationId(newConversation.id);
        }
      } else {
        // Pentru utilizatorii neautentificați, salvăm doar în starea locală
        setConversations(prev => [...prev, newConversation]);
        setCurrentConversationId(newConversation.id);
      }
      
      // Când se creează o conversație nouă, nu mai avem nevoie de titlu în așteptare
      setPendingConversationTitle(null);
    } 
    // Actualizăm conversația existentă
    else if (currentConversationId) {
      // Actualizăm starea locală
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
      
      if (isAuthenticated) {
        try {
          // Pentru utilizatorii autentificați, salvăm și în baza de date
          console.log('Adding message to conversation in database:', currentConversationId);
          await conversationService.addMessage(currentConversationId, message);
        } catch (error) {
          console.error('Error adding message to conversation in database:', error);
        }
      }
    }
  };

  // Create a new conversation
  const createNewConversation = (therapistId: TherapistId) => {
    // Doar setăm contextul pentru interacțiunea viitoare
    setCurrentConversationId(null);
    setCurrentTherapistId(therapistId);
    setMessages([]);
    setPendingConversationTitle('Începe conversația...');
    setIsMenuOpen(false);
    setIsTherapistSelectorOpen(false);
  };

  // Load an existing conversation
  const loadConversation = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (conversation) {
      setCurrentConversationId(conversationId);
      setCurrentTherapistId(conversation.therapistId);
      setPendingConversationTitle(null); // Nu avem nevoie de titlu în așteptare pentru o conversație existentă
      setIsMenuOpen(false);
    }
    
    // Pentru utilizatorii autentificați, verificăm dacă sunt actualizări în baza de date
    if (isAuthenticated && conversation) {
      try {
        const freshConversation = await conversationService.getConversation(conversationId);
        
        if (freshConversation) {
          // Actualizăm starea locală cu datele proaspete
          setConversations(prev => 
            prev.map(conv => 
              conv.id === conversationId ? freshConversation : conv
            )
          );
        }
      } catch (error) {
        console.error('Error refreshing conversation from database:', error);
      }
    }
  };

  // Toggle favorite status for a conversation
  const toggleFavorite = async (conversationId: string) => {
    // Actualizăm starea locală
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId
        ? { ...conv, isFavorite: !conv.isFavorite }
        : conv
    );
    
    setConversations(updatedConversations);
    
    // Obținem starea actualizată pentru conversația specifică
    const updatedConversation = updatedConversations.find(c => c.id === conversationId);
    
    if (!updatedConversation) return;
    
    if (isAuthenticated) {
      try {
        // Pentru utilizatorii autentificați, actualizăm și în baza de date
        console.log('Updating favorite status in database:', conversationId, updatedConversation.isFavorite);
        await conversationService.toggleFavorite(conversationId, updatedConversation.isFavorite);
      } catch (error) {
        console.error('Error updating favorite status in database:', error);
      }
    }
  };
  
  // Rename a conversation
  const renameConversation = async (conversationId: string, newTitle: string) => {
    // Actualizăm starea locală
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId
          ? { ...conv, title: newTitle, updatedAt: Date.now() }
          : conv
      )
    );
    
    if (isAuthenticated) {
      try {
        // Pentru utilizatorii autentificați, actualizăm și în baza de date
        console.log('Renaming conversation in database:', conversationId, newTitle);
        await conversationService.renameConversation(conversationId, newTitle);
      } catch (error) {
        console.error('Error renaming conversation in database:', error);
      }
    }
  };
  
  // Delete a conversation
  const deleteConversation = async (conversationId: string) => {
    // Actualizăm starea locală
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    // If we're deleting the current conversation, clear it
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
      setPendingConversationTitle('Începe conversația...'); // Resetăm titlul în așteptare
    }
    
    if (isAuthenticated) {
      try {
        // Pentru utilizatorii autentificați, ștergem și din baza de date
        console.log('Deleting conversation from database:', conversationId);
        await conversationService.deleteConversation(conversationId);
      } catch (error) {
        console.error('Error deleting conversation from database:', error);
      }
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
        deleteConversation,
        pendingConversationTitle,
        showWelcomePage,
        setShowWelcomePage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};