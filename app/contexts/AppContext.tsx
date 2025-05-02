'use client';

// app/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Therapist, 
  TherapistId, 
  Conversation, 
  Message, 
  JournalEntry, 
  JournalTemplate,
  JournalTemplateId,
  ExplorationPoint
} from '../types';
import { v4 as uuidv4 } from 'uuid';

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

// Define journal templates
const journalTemplates: JournalTemplate[] = [
  {
    id: 'daily',
    name: 'Jurnal zilnic',
    description: 'Reflectează asupra zilei tale și notează gândurile, emoțiile și evenimentele importante',
    icon: 'calendar',
    color: 'var(--color-primary)',
    prompts: [
      'Cum te-ai simțit astăzi, în general?',
      'Ce momente ți-au adus bucurie sau satisfacție?',
      'Ce provocări ai întâmpinat și cum le-ai gestionat?',
      'Ce ai învățat azi despre tine sau despre alții?',
      'Ce așteptări ai pentru ziua de mâine?'
    ]
  },
  {
    id: 'gratitude',
    name: 'Jurnal de recunoștință',
    description: 'Notează lucrurile pentru care ești recunoscător și cultivă o perspectivă pozitivă',
    icon: 'heart',
    color: 'var(--color-accent)',
    prompts: [
      'Enumeră 3 lucruri pentru care ești recunoscător astăzi',
      'A fost cineva care te-a ajutat astăzi? Ce apreciezi la acea persoană?',
      'Ce moment mic din ziua de azi ți-a adus bucurie?',
      'Ce ai în viața ta acum și pentru care ai visat în trecut?',
      'Ce aspect al sănătății tale îți e recunoscător corpul tău?'
    ]
  },
  {
    id: 'affirmation',
    name: 'Jurnal de afirmații',
    description: 'Creează și reflectează asupra afirmațiilor pozitive care să te susțină în atingerea obiectivelor',
    icon: 'star',
    color: 'var(--color-secondary-dark)',
    prompts: [
      'Scrie 3 afirmații pozitive despre tine',
      'Ce crezi despre tine și ai vrea să schimbi?',
      'Ce afirmație te-ar putea ajuta când te confrunți cu îndoieli?',
      'Ce afirmație te-ar putea ajuta să îți atingi obiectivele?',
      'Ce calitate ai vrea să cultivi mai mult și cum o poți afirma?'
    ]
  },
  {
    id: 'reflection',
    name: 'Jurnal de reflecție',
    description: 'Analizează experiențele din trecut și identifică lecții și modele de comportament',
    icon: 'moon',
    color: 'var(--color-primary-dark)',
    prompts: [
      'Ce pattern-uri ai observat în comportamentul tău recent?',
      'Care a fost o situație dificilă din ultima perioadă și cum ai gestionat-o?',
      'Ce ți-ai dori să fi făcut diferit și de ce?',
      'Ce ai învățat despre tine în ultimul timp?',
      'Cum te-au schimbat experiențele recente?'
    ]
  }
];

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

// Generate title for journal entry
const generateJournalTitle = (templateId: JournalTemplateId, content: string): string => {
  const date = new Date();
  const formattedDate = date.toLocaleDateString('ro-RO', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const template = journalTemplates.find(t => t.id === templateId);
  const templateName = template ? template.name : 'Jurnal';
  
  if (!content || content.trim().length === 0) {
    return `${templateName} - ${formattedDate}`;
  }
  
  // If there's content, try to extract first line or first few words
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length === 0) {
    return `${templateName} - ${formattedDate}`;
  }
  
  // Use first line if short enough, otherwise truncate
  if (firstLine.length <= 30) {
    return `${firstLine} - ${formattedDate}`;
  } else {
    const words = firstLine.split(' ');
    const titleWords = words.slice(0, Math.min(4, words.length));
    const titleStart = titleWords.join(' ');
    return `${titleStart}... - ${formattedDate}`;
  }
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
  
  // Journal functionality
  journals: JournalEntry[];
  currentJournal: JournalEntry | null;
  setCurrentJournal: (journalId: string | null) => void;
  journalTemplates: JournalTemplate[];
  createNewJournal: (templateId: JournalTemplateId) => string;
  updateJournal: (journalId: string, content: string) => void;
  deleteJournal: (journalId: string) => void;
  addExplorationPoint: (journalId: string, point: Omit<ExplorationPoint, 'id' | 'createdAt'>) => string;
  updateExplorationPoint: (journalId: string, pointId: string, updates: Partial<ExplorationPoint>) => void;
  startConversationFromJournal: (journalId: string, therapistId: TherapistId) => string;
  startConversationFromPoint: (journalId: string, pointId: string, therapistId: TherapistId) => string;
  isJournalModalOpen: boolean;
  setIsJournalModalOpen: (isOpen: boolean) => void;
  recentJournals: JournalEntry[];
  markJournalAsAnalyzed: (journalId: string) => void;
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
  // Welcome page state
  const [showWelcomePage, setShowWelcomePage] = useState<boolean>(true);
  // Titlul pentru conversația neîncepută încă
  const [pendingConversationTitle, setPendingConversationTitle] = useState<string | null>('Începe conversația...');
  
  // Journal states
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [currentJournalId, setCurrentJournalId] = useState<string | null>(null);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

  // Load conversations from localStorage on initial load
  useEffect(() => {
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
      
      setConversations(validConversations);
    }
    
    // Check if there was a current conversation
    const savedCurrentConversationId = localStorage.getItem('currentConversationId');
    if (savedCurrentConversationId) {
      setCurrentConversationId(savedCurrentConversationId);
    }
    
    // Load journals from localStorage
    const savedJournals = localStorage.getItem('journals');
    if (savedJournals) {
      setJournals(JSON.parse(savedJournals));
    }
    
    // Check if there was a current journal
    const savedCurrentJournalId = localStorage.getItem('currentJournalId');
    if (savedCurrentJournalId) {
      setCurrentJournalId(savedCurrentJournalId);
    }
  }, []);

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

  // Update localStorage when conversations change
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);
  
  // Update localStorage when journals change
  useEffect(() => {
    localStorage.setItem('journals', JSON.stringify(journals));
  }, [journals]);

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
  
  // Update localStorage when current journal changes
  useEffect(() => {
    if (currentJournalId) {
      localStorage.setItem('currentJournalId', currentJournalId);
    } else {
      localStorage.removeItem('currentJournalId');
    }
  }, [currentJournalId]);

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
    
  // Get current journal
  const currentJournal = currentJournalId
    ? journals.find(j => j.id === currentJournalId) || null
    : null;
    
  // Derived state for favorites and recent conversations
  const favoriteConversations = conversations
    .filter(c => c.isFavorite)
    .sort((a, b) => b.updatedAt - a.updatedAt);
    
  const recentConversations = conversations
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 10);
    
  // Recent journals
  const recentJournals = journals
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
    
    // Dacă nu există o conversație curentă și mesajul este de la utilizator
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
      // Când se creează o conversație nouă, nu mai avem nevoie de titlu în așteptare
      setPendingConversationTitle(null);
    } 
    // Actualizăm conversația existentă
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
    // Doar setăm contextul pentru interacțiunea viitoare
    setCurrentConversationId(null);
    setCurrentTherapistId(therapistId);
    setMessages([]);
    setPendingConversationTitle('Începe conversația...');
    setIsMenuOpen(false);
    setIsTherapistSelectorOpen(false);
  };

  // Load an existing conversation
  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setCurrentTherapistId(conversation.therapistId);
      setPendingConversationTitle(null); // Nu avem nevoie de titlu în așteptare pentru o conversație existentă
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
      setPendingConversationTitle('Începe conversația...'); // Resetăm titlul în așteptare
    }
  };
  
  // Create a new journal entry
  const createNewJournal = (templateId: JournalTemplateId): string => {
    const newJournal: JournalEntry = {
      id: uuidv4(),
      templateId,
      title: generateJournalTitle(templateId, ''),
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      explorationPoints: [],
      isAnalyzed: false
    };
    
    setJournals(prev => [...prev, newJournal]);
    setCurrentJournalId(newJournal.id);
    setIsJournalModalOpen(true);
    
    return newJournal.id;
  };
  
  // Update a journal entry
  const updateJournal = (journalId: string, content: string) => {
    setJournals(prev => 
      prev.map(journal => 
        journal.id === journalId
          ? { 
              ...journal, 
              content,
              title: generateJournalTitle(journal.templateId, content),
              updatedAt: Date.now()
            }
          : journal
      )
    );
  };
  
  // Mark journal as analyzed
  const markJournalAsAnalyzed = (journalId: string) => {
    setJournals(prev => 
      prev.map(journal => 
        journal.id === journalId
          ? { ...journal, isAnalyzed: true }
          : journal
      )
    );
  };
  
  // Delete a journal entry
  const deleteJournal = (journalId: string) => {
    setJournals(prev => prev.filter(journal => journal.id !== journalId));
    
    // If we're deleting the current journal, clear it
    if (currentJournalId === journalId) {
      setCurrentJournalId(null);
    }
  };
  
  // Add an exploration point to a journal
  const addExplorationPoint = (journalId: string, point: Omit<ExplorationPoint, 'id' | 'createdAt'>): string => {
    const pointId = uuidv4();
    const newPoint: ExplorationPoint = {
      ...point,
      id: pointId,
      createdAt: Date.now()
    };
    
    setJournals(prev => 
      prev.map(journal => 
        journal.id === journalId
          ? { 
              ...journal, 
              explorationPoints: [...journal.explorationPoints, newPoint],
              updatedAt: Date.now()
            }
          : journal
      )
    );
    
    return pointId;
  };
  
  // Update an exploration point
  const updateExplorationPoint = (journalId: string, pointId: string, updates: Partial<ExplorationPoint>) => {
    setJournals(prev => 
      prev.map(journal => 
        journal.id === journalId
          ? { 
              ...journal, 
              explorationPoints: journal.explorationPoints.map(point => 
                point.id === pointId
                  ? { ...point, ...updates }
                  : point
              ),
              updatedAt: Date.now()
            }
          : journal
      )
    );
  };
  
  // Start a conversation from a journal entry
  const startConversationFromJournal = (journalId: string, therapistId: TherapistId): string => {
    const journal = journals.find(j => j.id === journalId);
    if (!journal) {
      throw new Error('Journal not found');
    }
    
    const template = journalTemplates.find(t => t.id === journal.templateId);
    
    // Create initial messages
    const initialMessages: Message[] = [
      {
        role: 'user',
        content: `Bună, mi-am scris jurnalul despre ${template?.name.toLowerCase() || 'ziua mea'} și aș dori să discut despre asta:\n\n${journal.content}`,
        displayed: true,
        timestamp: Date.now()
      }
    ];
    
    // Create the conversation
    const newConversation: Conversation = {
      id: uuidv4(),
      title: `Discuție despre: ${journal.title}`,
      therapistId,
      messages: initialMessages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isFavorite: false,
      journalEntryId: journalId
    };
    
    // Add the conversation to the list
    setConversations(prev => [...prev, newConversation]);
    
    // Set the current conversation
    setCurrentConversationId(newConversation.id);
    setCurrentTherapistId(therapistId);
    setMessages(initialMessages);
    setPendingConversationTitle(null);
    setIsMenuOpen(false);
    setIsJournalModalOpen(false);
    
    return newConversation.id;
  };
  
  // Start a conversation from an exploration point
  const startConversationFromPoint = (journalId: string, pointId: string, therapistId: TherapistId): string => {
    const journal = journals.find(j => j.id === journalId);
    if (!journal) {
      throw new Error('Journal not found');
    }
    
    const point = journal.explorationPoints.find(p => p.id === pointId);
    if (!point) {
      throw new Error('Exploration point not found');
    }
    
    // Create initial messages
    const initialMessages: Message[] = [
      {
        role: 'user',
        content: `În jurnalul meu am menționat următorul aspect pe care aș vrea să-l explorez mai mult:\n\n${point.content}\n\nContextul din jurnal a fost:\n\n${journal.content}`,
        displayed: true,
        timestamp: Date.now()
      }
    ];
    
    // Create the conversation
    const newConversation: Conversation = {
      id: uuidv4(),
      title: `Explorare: ${point.content.substring(0, 30)}...`,
      therapistId,
      messages: initialMessages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isFavorite: false,
      journalEntryId: journalId,
      explorationPointId: pointId
    };
    
    // Add the conversation to the list
    setConversations(prev => [...prev, newConversation]);
    
    // Mark the exploration point as explored
    updateExplorationPoint(journalId, pointId, { 
      isExplored: true,
      conversationId: newConversation.id
    });
    
    // Set the current conversation
    setCurrentConversationId(newConversation.id);
    setCurrentTherapistId(therapistId);
    setMessages(initialMessages);
    setPendingConversationTitle(null);
    setIsMenuOpen(false);
    setIsJournalModalOpen(false);
    
    return newConversation.id;
  };
  
  // Set current journal
  const setCurrentJournal = (journalId: string | null) => {
    setCurrentJournalId(journalId);
    if (journalId) {
      setIsJournalModalOpen(true);
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
        setShowWelcomePage,
        
        // Journal functionality
        journals,
        currentJournal,
        setCurrentJournal,
        journalTemplates,
        createNewJournal,
        updateJournal,
        deleteJournal,
        addExplorationPoint,
        updateExplorationPoint,
        startConversationFromJournal,
        startConversationFromPoint,
        isJournalModalOpen,
        setIsJournalModalOpen,
        recentJournals,
        markJournalAsAnalyzed
      }}
    >
      {children}
    </AppContext.Provider>
  );
};