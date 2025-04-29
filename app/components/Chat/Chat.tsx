'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { Message } from '@/app/types';
import styles from './Chat.module.css';
import TherapeuticExercise from '../TherapeuticExercises/TherapeuticExercise';

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
  // Stări adiționale pentru considerații terapeutice
  const [calmMode, setCalmMode] = useState<boolean>(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState<boolean>(false);
  const [currentEmotionalState, setCurrentEmotionalState] = useState<string>('neutral');
  const [showSupportMessage, setShowSupportMessage] = useState<boolean>(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

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

  // Auto-resize textarea cu tranziție mai blândă
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 250)}px`;

      // Focusăm doar dacă utilizatorul a început deja să scrie
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

  // Scroll to bottom function - memoize with useCallback
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      if (calmMode) {
        // Scroll mai blând în calm mode
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
          
          // Detectează potențiale nevoi de exerciții terapeutice
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            const content = lastMessage.content.toLowerCase();
            
            // Detectează nevoia unui exercițiu de respirație
            if (content.includes('respiră') || content.includes('anxios') || 
                content.includes('anxietate') || content.includes('calmează')) {
              setShowBreathingExercise(true);
            }
            
            // Detectează starea emoțională
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
      }, calmMode ? 3000 : 2000); // Mai mult timp pentru procesare în calm mode
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAnimating, messages, calmMode]);

  // Determină clasa emoțională pentru mesaje
  const getMessageEmotionalClass = (content: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('respiră') || lowerContent.includes('calm') || 
        lowerContent.includes('liniștit')) {
      return styles.messageCalming;
    } 
    else if (lowerContent.includes('poți') || lowerContent.includes('încearcă') || 
            lowerContent.includes('e normal')) {
      return styles.messageSupportive;
    } 
    else if (lowerContent.includes('observă') || lowerContent.includes('atent') || 
            lowerContent.includes('concentrează')) {
      return styles.messageFocusing;
    }
    
    return '';
  };

  // Determină dacă un mesaj are conținut emoțional
  const getEmotionalContentClass = (content: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('fericit') || lowerContent.includes('bucurie') || 
        lowerContent.includes('succes')) {
      return `${styles.emotionalContent} ${styles.emotionPositive}`;
    }
    else if (lowerContent.includes('trist') || lowerContent.includes('frică') || 
            lowerContent.includes('anxietate')) {
      return `${styles.emotionalContent} ${styles.emotionSensitive}`;
    }
    else if (lowerContent.includes('neutru') || lowerContent.includes('gândesc') || 
            lowerContent.includes('cred')) {
      return `${styles.emotionalContent} ${styles.emotionNeutral}`;
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

    // Ascunde exercițiile terapeutice când utilizatorul trimite un nou mesaj
    setShowBreathingExercise(false);
    setShowSupportMessage(false);

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

      // Call API - don't pass the signal to avoid abort errors
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

  // Închide exercițiul de respirație
  const handleCloseBreathingExercise = () => {
    setShowBreathingExercise(false);
  };

  return (
    <div 
      className={`${styles.chatWindow} ${calmMode ? styles.calmMode : ''}`}
      ref={chatWindowRef}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Calm mode toggle */}
      <button
        className={`${styles.calmModeButton} ${calmMode ? styles.calmModeActive : ''}`}
        onClick={toggleCalmMode}
        aria-label={calmMode ? "Dezactivează modul calm" : "Activează modul calm"}
        title={calmMode ? "Dezactivează modul calm" : "Activează modul calm"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>

      {/* Messages */}
      <div
        className={`${styles.messagesContainer} ${calmMode ? styles.calmMessagesContainer : ''}`}
        ref={messagesContainerRef}
        style={{
          height: `calc(100% - ${inputHeight}px - ${showBreathingExercise ? '220px' : '0px'})`,
          paddingBottom: '16px'
        }}
        role="log"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          // Welcome message when no messages exist - cu versiune calmă
          <div className={`${styles.welcomeContainer} ${calmMode ? styles.calmWelcomeContainer : ''}`}>
            <div className={styles.welcomeIcon} aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className={styles.welcomeTitle}>Bine ai venit la sesiunea ta de terapie</h2>
            <p className={styles.welcomeText}>
              {calmMode 
                ? "Aici ai un spațiu sigur pentru a vorbi despre orice te preocupă. Respiră adânc și ia-ți timpul necesar."
                : "Întreabă-mă despre dezvoltare personală, stabilirea obiectivelor sau orice provocări cu care te confrunți"
              }
            </p>
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
            </div>
          </div>
        )}

        {/* Reference for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Breathing exercise component - conditional */}
      {showBreathingExercise && (
        <TherapeuticExercise
          type="breathing"
          onClose={handleCloseBreathingExercise}
          calmMode={calmMode}
        />
      )}

      {/* Support message pentru situații emoționale */}
      {showSupportMessage && (
        <div className={`${styles.supportMessage} ${calmMode ? styles.calmSupportMessage : ''}`}>
          <p>Este perfect normal să simți emoții puternice. Ia-ți timp să procesezi ce simți.</p>
          {calmMode && (
            <button className={styles.supportButton} onClick={() => setShowBreathingExercise(true)}>
              Începe un exercițiu de respirație
            </button>
          )}
        </div>
      )}

      {/* Input form */}
      <div className={`${styles.inputContainer} ${calmMode ? styles.calmInputContainer : ''}`} ref={inputContainerRef}>
        <div className={styles.innerInputContainer}>
          <form onSubmit={handleSubmit} className={styles.inputGrid}>
            <div className={styles.textareaContainer}>
              <label htmlFor="message-input" className="sr-only">Scrie un mesaj</label>
              <textarea
                id="message-input"
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={calmMode ? "Ia-ți timpul necesar să scrii ce simți..." : "Scrie un mesaj..."}
                disabled={isLoading}
                rows={1}
                aria-label="Mesaj către terapeut"
                className={calmMode ? styles.calmTextarea : ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                  }
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`${styles.sendButton} ${calmMode ? styles.calmSendButton : ''}`}
              aria-label="Trimite mesaj"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>

        {/* Disclaimer text - with therapeutic considerations */}
        {!hasStartedConversation && (
          <div className={`${styles.disclaimerText} ${!hasStartedConversation ? '' : styles.hidden} ${calmMode ? styles.calmDisclaimerText : ''}`}>
            {calmMode 
              ? `${currentTherapist.name} este aici pentru a te sprijini. Confidențialitatea și confortul tău sunt prioritare.`
              : `${currentTherapist.name} este un instrument de suport, nu un înlocuitor pentru terapia profesională.`
            }
          </div>
        )}
      </div>

      {/* Emotional state indicator pentru debug
      <div className={styles.emotionalStateDebug}>
        State: {currentEmotionalState}
      </div> */}
    </div>
  );
}