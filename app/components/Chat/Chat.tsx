<<<<<<< HEAD
// Chat Component Redesign
=======
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { Message } from '@/app/types';
<<<<<<< HEAD
import TherapeuticExercise from '../TherapeuticExercises/TherapeuticExercise';
import { motion, AnimatePresence } from 'framer-motion';
=======
import styles from './Chat.module.css';
import TherapeuticExercise from '../TherapeuticExercises/TherapeuticExercise';
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e

export default function Chat() {
  // Get state and functions from context
  const {
    messages,
    addMessage,
    currentTherapist,
    currentConversation
  } = useApp();

  // Local state
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [hasStartedConversation, setHasStartedConversation] = useState<boolean>(false);
  const [inputHeight, setInputHeight] = useState<number>(0);
<<<<<<< HEAD
=======
  // Stări adiționale pentru considerații terapeutice
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
  const [calmMode, setCalmMode] = useState<boolean>(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState<boolean>(false);
  const [currentEmotionalState, setCurrentEmotionalState] = useState<string>('neutral');
  const [showSupportMessage, setShowSupportMessage] = useState<boolean>(false);
<<<<<<< HEAD
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
=======
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);
<<<<<<< HEAD
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Sample emojis for the picker
  const emojis = ['😊', '😔', '😢', '😡', '😴', '😌', '🙏', '👍', '❤️', '🤔'];
=======
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e

  // Calculate input container height
  useEffect(() => {
    const updateInputHeight = () => {
      if (inputContainerRef.current) {
        const height = inputContainerRef.current.offsetHeight;
        setInputHeight(height);
      }
    };
    
    updateInputHeight();
    
    // Also update on window resize
    window.addEventListener('resize', updateInputHeight);
    return () => window.removeEventListener('resize', updateInputHeight);
  }, [input, hasStartedConversation]);

<<<<<<< HEAD
  // Auto-resize textarea
=======
  // Auto-resize textarea cu tranziție mai blândă
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 250)}px`;

<<<<<<< HEAD
      // Focus only if user has started typing
=======
      // Focusăm doar dacă utilizatorul a început deja să scrie
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
      if (input.length > 0) {
        textareaRef.current.focus();
      }
    }
  }, [input]);

  // Set hasStartedConversation based on messages
  useEffect(() => {
    if (messages.length > 0) {
      setHasStartedConversation(true);
    } else {
      setHasStartedConversation(false);
    }
  }, [messages]);

  // Set up mounted state tracking
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      // Cancel any in-flight requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

<<<<<<< HEAD
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

=======
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
  // Scroll to bottom function - memoize with useCallback
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      if (calmMode) {
<<<<<<< HEAD
        // Smoother scroll in calm mode
=======
        // Scroll mai blând în calm mode
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      } else {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    }
  }, [calmMode]);

  // Scroll to bottom for new messages
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure layout has settled
      const timeoutId = setTimeout(scrollToBottom, calmMode ? 300 : 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, isLoading, scrollToBottom, calmMode]);

  // Animate assistant messages - with therapeutic considerations
  useEffect(() => {
    if (isAnimating && messages.length > 0) {
      // Set a timeout to mark animation as complete after a reasonable time
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          setIsAnimating(false);
          
<<<<<<< HEAD
          // Detect potential needs for therapeutic exercises
=======
          // Detectează potențiale nevoi de exerciții terapeutice
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            const content = lastMessage.content.toLowerCase();
            
<<<<<<< HEAD
            // Generate suggested replies based on last message
            generateSuggestedReplies(lastMessage.content);
            
            // Detect need for breathing exercise
=======
            // Detectează nevoia unui exercițiu de respirație
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
            if (content.includes('respiră') || content.includes('anxios') || 
                content.includes('anxietate') || content.includes('calmează')) {
              setShowBreathingExercise(true);
            }
            
<<<<<<< HEAD
            // Detect emotional state
=======
            // Detectează starea emoțională
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
            if (content.includes('trist') || content.includes('supărat')) {
              setCurrentEmotionalState('sensitive');
              setShowSupportMessage(true);
            } else if (content.includes('bucurie') || content.includes('mândru') || 
                      content.includes('mulțumit')) {
              setCurrentEmotionalState('positive');
            } else if (content.includes('calm') || content.includes('liniștit')) {
              setCurrentEmotionalState('calm');
            } else if (content.includes('atent') || content.includes('focus') || 
                      content.includes('concentrare')) {
              setCurrentEmotionalState('focus');
            }
          }
        }
<<<<<<< HEAD
      }, calmMode ? 3000 : 2000); // More time for processing in calm mode
=======
      }, calmMode ? 3000 : 2000); // Mai mult timp pentru procesare în calm mode
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAnimating, messages, calmMode]);

<<<<<<< HEAD
  // Generate suggested replies based on the assistant's message
  const generateSuggestedReplies = (message: string) => {
    // This is a simplified implementation - in a real app, you would use NLP or AI
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cum te simți')) {
      setSuggestedReplies(['Mă simt bine', 'Mă simt anxios', 'Mă simt trist']);
    } else if (lowerMessage.includes('ce părere ai')) {
      setSuggestedReplies(['Cred că e o idee bună', 'Nu sunt sigur', 'Aș vrea să știu mai multe']);
    } else if (lowerMessage.includes('întrebare')) {
      setSuggestedReplies(['Da, sunt de acord', 'Nu, nu cred', 'Poți elabora mai mult?']);
    } else if (messages.length === 1) {
      // First message from therapist
      setSuggestedReplies(['Mulțumesc pentru întâmpinare', 'Mă simt anxios azi', 'Vreau să discutăm despre...']);
    } else {
      // Default suggestions
      setSuggestedReplies(['Poți să îmi spui mai mult?', 'Înțeleg', 'Cum mă poate ajuta asta?']);
    }
  };

  // Determine emotional class for messages
=======
  // Determină clasa emoțională pentru mesaje
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
  const getMessageEmotionalClass = (content: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('respiră') || lowerContent.includes('calm') || 
        lowerContent.includes('liniștit')) {
<<<<<<< HEAD
      return 'message-calming';
    } 
    else if (lowerContent.includes('poți') || lowerContent.includes('încearcă') || 
            lowerContent.includes('e normal')) {
      return 'message-supportive';
    } 
    else if (lowerContent.includes('observă') || lowerContent.includes('atent') || 
            lowerContent.includes('concentrează')) {
      return 'message-focusing';
=======
      return styles.messageCalming;
    } 
    else if (lowerContent.includes('poți') || lowerContent.includes('încearcă') || 
            lowerContent.includes('e normal')) {
      return styles.messageSupportive;
    } 
    else if (lowerContent.includes('observă') || lowerContent.includes('atent') || 
            lowerContent.includes('concentrează')) {
      return styles.messageFocusing;
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
    }
    
    return '';
  };

<<<<<<< HEAD
  // Determine if a message has emotional content
=======
  // Determină dacă un mesaj are conținut emoțional
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
  const getEmotionalContentClass = (content: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('fericit') || lowerContent.includes('bucurie') || 
        lowerContent.includes('succes')) {
<<<<<<< HEAD
      return 'emotional-content positive';
    }
    else if (lowerContent.includes('trist') || lowerContent.includes('frică') || 
            lowerContent.includes('anxietate')) {
      return 'emotional-content sensitive';
    }
    else if (lowerContent.includes('neutru') || lowerContent.includes('gândesc') || 
            lowerContent.includes('cred')) {
      return 'emotional-content neutral';
=======
      return `${styles.emotionalContent} ${styles.emotionPositive}`;
    }
    else if (lowerContent.includes('trist') || lowerContent.includes('frică') || 
            lowerContent.includes('anxietate')) {
      return `${styles.emotionalContent} ${styles.emotionSensitive}`;
    }
    else if (lowerContent.includes('neutru') || lowerContent.includes('gândesc') || 
            lowerContent.includes('cred')) {
      return `${styles.emotionalContent} ${styles.emotionNeutral}`;
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
    }
    
    return '';
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Set conversation started state
    if (!hasStartedConversation) {
      setHasStartedConversation(true);
    }

<<<<<<< HEAD
    // Hide therapeutic exercises when user sends a new message
    setShowBreathingExercise(false);
    setShowSupportMessage(false);
    setSuggestedReplies([]);
=======
    // Ascunde exercițiile terapeutice când utilizatorul trimite un nou mesaj
    setShowBreathingExercise(false);
    setShowSupportMessage(false);
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e

    // Create user message
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      displayed: true
    };

    // Clear input and set loading state
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    addMessage(userMessage);

    try {
      // Cancel any previous ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();

      // Prepare message data for API
      const messageData = [
        ...messages,
        userMessage
      ].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

<<<<<<< HEAD
      // Call API
=======
      // Call API - don't pass the signal to avoid abort errors
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messageData,
          therapistId: currentTherapist.id
        })
      });

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();

      // Check again if component is still mounted
      if (!isMountedRef.current) return;

      // Add assistant response and animate
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
        displayed: false // Initially not fully displayed
      };

      // Add the message and start animation
      addMessage(assistantMessage);
      setIsAnimating(true);
      setDisplayedText(data.content);

      // Scroll to the bottom
      scrollToBottom();

    } catch (error) {
      console.error('Error:', error);

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      // Only add error message if the request wasn't aborted by user action
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        // More specific error messages
        let errorMessage = 'Îmi pare rău, am întâmpinat o eroare. Te rog să încerci din nou.';
        
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Cererea a durat prea mult. Te rugăm să încerci din nou.';
          } else if (error.message.includes('429')) {
            errorMessage = 'Prea multe cereri. Te rugăm să aștepți puțin înainte de a încerca din nou.';
          }
        }

        const errorResponse: Message = {
          role: 'assistant',
          content: errorMessage,
          displayed: true
        };

        addMessage(errorResponse);
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      
      // Clear the abort controller reference
      abortControllerRef.current = null;

      // Ensure consistent input box height
      if (textareaRef.current && isMountedRef.current) {
        setTimeout(() => {
          if (textareaRef.current && isMountedRef.current) {
            textareaRef.current.style.height = '24px';
          }
        }, 0);
      }
    }
  };

  // Format message content with proper line breaks
  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Toggle calm mode
  const toggleCalmMode = () => {
    setCalmMode(prev => !prev);
  };

<<<<<<< HEAD
  // Close breathing exercise
=======
  // Închide exercițiul de respirație
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
  const handleCloseBreathingExercise = () => {
    setShowBreathingExercise(false);
  };

<<<<<<< HEAD
  // Handle emoji selection
  const handleEmojiClick = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
    
    // Focus the textarea after adding emoji
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle suggested reply click
  const handleSuggestedReplyClick = (reply: string) => {
    setInput(reply);
    
    // Focus the textarea after setting suggested reply
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: calmMode ? 0.5 : 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: calmMode ? 0.4 : 0.2 }
    }
  };

  return (
    <div 
      className={`chat-container ${calmMode ? 'calm-mode' : ''}`}
=======
  return (
    <div 
      className={`${styles.chatWindow} ${calmMode ? styles.calmMode : ''}`}
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
      ref={chatWindowRef}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Calm mode toggle */}
      <button
<<<<<<< HEAD
        className={`calm-mode-toggle ${calmMode ? 'active' : ''}`}
=======
        className={`${styles.calmModeButton} ${calmMode ? styles.calmModeActive : ''}`}
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
        onClick={toggleCalmMode}
        aria-label={calmMode ? "Dezactivează modul calm" : "Activează modul calm"}
        title={calmMode ? "Dezactivează modul calm" : "Activează modul calm"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
<<<<<<< HEAD
=======
          className="w-5 h-5"
          aria-hidden="true"
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>

<<<<<<< HEAD
      {/* Messages container */}
      <div
        className={`messages-container ${calmMode ? 'calm-messages' : ''}`}
=======
      {/* Messages */}
      <div
        className={`${styles.messagesContainer} ${calmMode ? styles.calmMessagesContainer : ''}`}
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
        ref={messagesContainerRef}
        style={{
          height: `calc(100% - ${inputHeight}px - ${showBreathingExercise ? '220px' : '0px'})`,
          paddingBottom: '16px'
        }}
        role="log"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
<<<<<<< HEAD
          // Welcome message when no messages exist
          <div className={`welcome-message ${calmMode ? 'calm-welcome' : ''}`}>
            <div className="welcome-avatar-container">
              <img 
                src={currentTherapist.avatarSrc}
                alt={currentTherapist.name}
                className="welcome-avatar"
              />
            </div>
            <h2 className="welcome-title">Bun venit la sesiunea ta cu {currentTherapist.name}</h2>
            <p className="welcome-description">
=======
          // Welcome message when no messages exist - cu versiune calmă
          <div className={`${styles.welcomeContainer} ${calmMode ? styles.calmWelcomeContainer : ''}`}>
            <div className={styles.welcomeIcon} aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className={styles.welcomeTitle}>Bine ai venit la sesiunea ta de terapie</h2>
            <p className={styles.welcomeText}>
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
              {calmMode 
                ? "Aici ai un spațiu sigur pentru a vorbi despre orice te preocupă. Respiră adânc și ia-ți timpul necesar."
                : "Întreabă-mă despre dezvoltare personală, stabilirea obiectivelor sau orice provocări cu care te confrunți"
              }
            </p>
<<<<<<< HEAD
            <div className="welcome-suggestions">
              <p className="suggestions-label">Poți începe cu:</p>
              <div className="suggestion-buttons">
                <button 
                  className="suggestion-button"
                  onClick={() => setInput("Mă simt anxios și nu știu cum să gestionez asta.")}
                >
                  Mă simt anxios...
                </button>
                <button 
                  className="suggestion-button"
                  onClick={() => setInput("Cum pot să-mi îmbunătățesc stima de sine?")}
                >
                  Stima de sine
                </button>
                <button 
                  className="suggestion-button"
                  onClick={() => setInput("Cum pot să gestionez mai bine stresul zilnic?")}
                >
                  Gestionarea stresului
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Message list with animation
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const isLastAssistantMessage = 
                message.role === 'assistant' && 
                index === messages.length - 1 && 
                isAnimating;
                
              // Determine emotional class
              const emotionalClass = message.role === 'assistant' 
                ? getMessageEmotionalClass(message.content)
                : '';
                
              // Determine if message has emotional content
              const emotionalContentClass = message.role === 'user'
                ? getEmotionalContentClass(message.content)
                : '';
              
              // Determine if message includes an exercise
              const hasExercise = message.role === 'assistant' && 
                (message.content.includes('exercițiu') || message.content.includes('respiră'));
              
              return (
                <motion.div
                  key={index}
                  className={`message-row ${message.role === 'user' ? 'user-row' : 'assistant-row'}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  aria-label={`${message.role === 'user' ? 'Tu' : currentTherapist.name} a spus`}
                >
                  {message.role === 'assistant' && (
                    <div className="avatar-container">
                      <img 
                        src={currentTherapist.avatarSrc}
                        alt={currentTherapist.name}
                        className="avatar"
                      />
                    </div>
                  )}
                  
                  <div 
                    className={`message-bubble ${message.role === 'user' ? 'user-message' : 'assistant-message'}
                              ${emotionalClass}
                              ${emotionalContentClass}
                              ${hasExercise ? 'has-exercise' : ''}
                              ${calmMode ? 'calm-bubble' : ''}`}
                  >
                    {isLastAssistantMessage ? (
                      // Animated typing effect for last assistant message
                      <div className="typing-animation">
                        <div className={calmMode ? 'calm-typing-text' : 'typing-text'}>
                          {formatMessage(displayedText)}
                        </div>
                      </div>
                    ) : (
                      // Normal message display
                      formatMessage(message.content)
                    )}
                    
                    {hasExercise && (
                      <button 
                        className="exercise-button"
                        onClick={() => setShowBreathingExercise(true)}
                      >
                        Începe exercițiul
                      </button>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="avatar-container user-avatar">
                      <div className="user-initial">
                        {/* User's initial or avatar would go here */}
                        U
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="loading-indicator-row">
            <div className="avatar-container">
              <img 
                src={currentTherapist.avatarSrc}
                alt={currentTherapist.name}
                className="avatar"
              />
            </div>
            <div 
              className={`loading-indicator ${calmMode ? 'calm-loading' : ''}`}
              aria-label={`${currentTherapist.name} scrie...`}
            >
              <div className="loading-dot" aria-hidden="true" />
              <div className="loading-dot" aria-hidden="true" />
              <div className="loading-dot" aria-hidden="true" />
=======
          </div>
        ) : (
          // Message list
          messages.map((message, index) => {
            const isLastAssistantMessage = 
              message.role === 'assistant' && 
              index === messages.length - 1 && 
              isAnimating;
              
            // Determină clasa emoțională
            const emotionalClass = message.role === 'assistant' 
              ? getMessageEmotionalClass(message.content)
              : '';
              
            // Determină dacă mesajul are conținut emoțional
            const emotionalContentClass = message.role === 'user'
              ? getEmotionalContentClass(message.content)
              : '';
            
            // Determină dacă mesajul include un exercițiu
            const hasExercise = message.role === 'assistant' && 
              (message.content.includes('exercițiu') || message.content.includes('respiră'));
              
            return (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                aria-label={`${message.role === 'user' ? 'Tu' : currentTherapist.name} a spus`}
              >
                <div 
                  className={`${styles.messageBubble} 
                             ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}
                             ${emotionalClass}
                             ${emotionalContentClass}
                             ${hasExercise ? styles.withExercise : ''}
                             ${calmMode ? styles.calmBubble : ''}
                             ${message.role === 'assistant' ? styles.highlightable : ''}`}
                >
                  {isLastAssistantMessage ? (
                    // If it's the last assistant message and it's animating
                    <div className={styles.typingAnimation}>
                      <div className={calmMode ? styles.calmTypingText : styles.typingText}>
                        {formatMessage(displayedText)}
                      </div>
                    </div>
                  ) : (
                    // Otherwise, display the message normally
                    formatMessage(message.content)
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading indicator - mai subtil în calm mode */}
        {isLoading && (
          <div className="flex justify-start">
            <div 
              className={`${styles.loadingIndicator} ${calmMode ? styles.calmLoadingIndicator : ''}`}
              aria-label={`${currentTherapist.name} scrie...`}
            >
              <div className={styles.loadingDot} aria-hidden="true" />
              <div className={styles.loadingDot} aria-hidden="true" />
              <div className={styles.loadingDot} aria-hidden="true" />
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
            </div>
          </div>
        )}

<<<<<<< HEAD
        {/* Suggested replies */}
        {suggestedReplies.length > 0 && !isLoading && !showBreathingExercise && (
          <motion.div 
            className="suggested-replies-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="suggested-replies">
              {suggestedReplies.map((reply, index) => (
                <button 
                  key={index}
                  className="suggested-reply"
                  onClick={() => handleSuggestedReplyClick(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>
          </motion.div>
        )}

=======
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
        {/* Reference for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

<<<<<<< HEAD
      {/* Breathing exercise component */}
=======
      {/* Breathing exercise component - conditional */}
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
      {showBreathingExercise && (
        <TherapeuticExercise
          type="breathing"
          onClose={handleCloseBreathingExercise}
          calmMode={calmMode}
        />
      )}

<<<<<<< HEAD
      {/* Support message for emotional situations */}
      {showSupportMessage && (
        <div className={`support-message ${calmMode ? 'calm-support' : ''}`}>
          <p>Este perfect normal să simți emoții puternice. Ia-ți timp să procesezi ce simți.</p>
          {calmMode && (
            <button className="support-button" onClick={() => setShowBreathingExercise(true)}>
=======
      {/* Support message pentru situații emoționale */}
      {showSupportMessage && (
        <div className={`${styles.supportMessage} ${calmMode ? styles.calmSupportMessage : ''}`}>
          <p>Este perfect normal să simți emoții puternice. Ia-ți timp să procesezi ce simți.</p>
          {calmMode && (
            <button className={styles.supportButton} onClick={() => setShowBreathingExercise(true)}>
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
              Începe un exercițiu de respirație
            </button>
          )}
        </div>
      )}

      {/* Input form */}
<<<<<<< HEAD
      <div className={`input-container ${calmMode ? 'calm-input' : ''}`} ref={inputContainerRef}>
        <div className="input-inner">
          <form onSubmit={handleSubmit} className="input-form">
            <div className="textarea-container">
              {/* Emoji button */}
              <button 
                type="button"
                className="emoji-button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                aria-label="Adaugă emoji"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {/* Emoji picker */}
              {showEmojiPicker && (
                <div className="emoji-picker" ref={emojiPickerRef}>
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      className="emoji-item"
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              
              <textarea
=======
      <div className={`${styles.inputContainer} ${calmMode ? styles.calmInputContainer : ''}`} ref={inputContainerRef}>
        <div className={styles.innerInputContainer}>
          <form onSubmit={handleSubmit} className={styles.inputGrid}>
            <div className={styles.textareaContainer}>
              <label htmlFor="message-input" className="sr-only">Scrie un mesaj</label>
              <textarea
                id="message-input"
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={calmMode ? "Ia-ți timpul necesar să scrii ce simți..." : "Scrie un mesaj..."}
                disabled={isLoading}
                rows={1}
                aria-label="Mesaj către terapeut"
<<<<<<< HEAD
                className={calmMode ? 'calm-textarea' : ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) {
                      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                    }
=======
                className={calmMode ? styles.calmTextarea : ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
                  }
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
<<<<<<< HEAD
              className={`send-button ${calmMode ? 'calm-send' : ''}`}
=======
              className={`${styles.sendButton} ${calmMode ? styles.calmSendButton : ''}`}
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
              aria-label="Trimite mesaj"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
<<<<<<< HEAD
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
=======
                stroke="white"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
              </svg>
            </button>
          </form>
        </div>

<<<<<<< HEAD
        {/* Disclaimer text */}
        {!hasStartedConversation && (
          <div className={`disclaimer-text ${!hasStartedConversation ? '' : 'hidden'} ${calmMode ? 'calm-disclaimer' : ''}`}>
=======
        {/* Disclaimer text - with therapeutic considerations */}
        {!hasStartedConversation && (
          <div className={`${styles.disclaimerText} ${!hasStartedConversation ? '' : styles.hidden} ${calmMode ? styles.calmDisclaimerText : ''}`}>
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
            {calmMode 
              ? `${currentTherapist.name} este aici pentru a te sprijini. Confidențialitatea și confortul tău sunt prioritare.`
              : `${currentTherapist.name} este un instrument de suport, nu un înlocuitor pentru terapia profesională.`
            }
          </div>
        )}
      </div>
<<<<<<< HEAD
=======

      {/* Emotional state indicator pentru debug
      <div className={styles.emotionalStateDebug}>
        State: {currentEmotionalState}
      </div> */}
>>>>>>> adbaa935ff9233ec4d232bbb04f7039876628c5e
    </div>
  );
}