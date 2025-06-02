'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { Message } from '@/app/types';

export default function Chat() {
  // Get state and functions from context
  const {
    messages,
    addMessage,
    setMessages,
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
  const [isTransitioningFromLoading, setIsTransitioningFromLoading] = useState<boolean>(false);

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 250)}px`;
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
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  // Scroll to bottom for new messages
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure layout has settled
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, isLoading, scrollToBottom]);

  // Animate assistant messages with smooth, therapeutic incremental display
  useEffect(() => {
    if (isAnimating && messages.length > 0) {
      // Get the last message (which should be the one animating)
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.role === 'assistant' && !lastMessage.displayed) {
        // Faster typing speed but still with a therapeutic feel (characters per second)
        const baseSpeed = 25; // Base characters per second (faster)
        const charactersPerSecond = Math.min(35, Math.max(baseSpeed, baseSpeed + lastMessage.content.length / 150));
        
        // Split message into words to allow for more natural typing behavior
        const words = lastMessage.content.split(/(\s+)/); // Split by whitespace but keep separators
        let currentContent = '';
        let wordIndex = 0;
        let charIndexInWord = 0;
        let currentIntervalId: NodeJS.Timeout | null = null;
        
        // Setup the typing animation function
        const processNextCharacter = () => {
          if (!isMountedRef.current) {
            if (currentIntervalId) clearInterval(currentIntervalId);
            return;
          }
          
          if (wordIndex < words.length) {
            const currentWord = words[wordIndex];
            
            // Add character by character within the current word
            if (charIndexInWord < currentWord.length) {
              // Add one character at a time
              currentContent += currentWord[charIndexInWord];
              charIndexInWord++;
              
              // Safely update displayed text
              if (isMountedRef.current) {
                setDisplayedText(currentContent);
              }
              
              // Add a brief pause at punctuation for more natural reading
              if (/[.,;:?!]/.test(currentWord[charIndexInWord - 1])) {
                // Briefly pause after punctuation
                if (currentIntervalId) clearInterval(currentIntervalId);
                
                setTimeout(() => {
                  if (isMountedRef.current) {
                    // Resume typing after pause
                    currentIntervalId = setInterval(processNextCharacter, 1000 / charactersPerSecond);
                  }
                }, 200); // Shorter pause after punctuation
              }
            } else {
              // Move to next word
              wordIndex++;
              charIndexInWord = 0;
            }
          } else {
            // We've reached the end
            if (currentIntervalId) clearInterval(currentIntervalId);
            
            // Small delay before marking as complete
            setTimeout(() => {
              if (isMountedRef.current) {
                setIsAnimating(false);
                
                // Update the message's displayed status in the context
                const updatedMessages = [...messages];
                updatedMessages[messages.length - 1] = {
                  ...lastMessage,
                  displayed: true
                };
                setMessages(updatedMessages);
              }
            }, 300); // Shorter pause at the end
          }
        };
        
        // Start the typing animation
        currentIntervalId = setInterval(processNextCharacter, 1000 / charactersPerSecond);
        
        // Clean up on unmount or when animation stops
        return () => {
          if (currentIntervalId) clearInterval(currentIntervalId);
        };
      }
    }
  }, [isAnimating, messages, setMessages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Set conversation started state
    if (!hasStartedConversation) {
      setHasStartedConversation(true);
    }

    // Create user message with timestamp
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      displayed: true,
      timestamp: Date.now()
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

      // Start transition from loading state to message
      setIsTransitioningFromLoading(true);
      
      // Short delay to allow loading animation to transition out
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Add assistant response and animate
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
        displayed: false, // Initially not fully displayed
        timestamp: Date.now()
      };

      // Prepare to start animation
      setDisplayedText(''); // Initialize with empty text to prevent flash
      
      // Add the message first with empty displayed content
      const messageForAnimation = {
        ...assistantMessage,
        content: assistantMessage.content, // Store full content
        _originalContent: assistantMessage.content // Keep original content for reference
      };
      
      addMessage(messageForAnimation);
      
      // Small delay before starting animation to prevent visual glitches
      setTimeout(() => {
        if (isMountedRef.current) {
          // Start animation
          setIsAnimating(true);
          
          // Reset transition flag after animation starts
          setTimeout(() => {
            if (isMountedRef.current) {
              setIsTransitioningFromLoading(false);
            }
          }, 300);
          
          // Scroll to the bottom
          scrollToBottom();
        }
      }, 50);

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
          displayed: true,
          timestamp: Date.now()
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

  return (
    <div 
      className="chat-window" 
      ref={chatWindowRef}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Messages */}
      <div
        className="messages-container"
        ref={messagesContainerRef}
        style={{
          height: `calc(100% - ${inputHeight}px)`,
          paddingBottom: '16px'
        }}
        role="log"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          // Welcome message when no messages exist
          <div className="welcome-container">
            <div className="welcome-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="welcome-title">Bine ai venit la sesiunea ta de terapie</h2>
            <p className="welcome-text">
              Întreabă-mă despre dezvoltare personală, stabilirea obiectivelor sau orice provocări cu care te confrunți
            </p>
          </div>
        ) : (
          // Message list
          messages.map((message, index) => {
            const isLastAssistantMessage = 
              message.role === 'assistant' && 
              index === messages.length - 1 && 
              isAnimating;
              
            return (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                aria-label={`${message.role === 'user' ? 'Tu' : currentTherapist.name} a spus`}
              >
                <div 
                  className={`message-bubble ${message.role === 'user' ? 'message-user' : 'message-assistant'} ${
                    message.role === 'assistant' && index === messages.length - 1 && isTransitioningFromLoading 
                    ? 'transition-from-loading' 
                    : ''
                  }`}
                >
                  {isLastAssistantMessage ? (
                    // If it's the last assistant message and it's animating
                    <div className="typing-animation-container">
                      <div className="typing-animation" key={displayedText.length}>
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

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div 
              className="message-bubble message-assistant loading-indicator"
              aria-label={`${currentTherapist.name} scrie...`}
            >
              <div className="loading-dot" aria-hidden="true" />
              <div className="loading-dot" aria-hidden="true" />
              <div className="loading-dot" aria-hidden="true" />
            </div>
          </div>
        )}

        {/* Reference for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <div className="input-container-wrapper" ref={inputContainerRef}>
        <div className="input-container">
          <form onSubmit={handleSubmit} className="input-grid">
            <div className="textarea-container">
              <label htmlFor="message-input" className="sr-only">Scrie un mesaj</label>
              <textarea
                id="message-input"
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Scrie un mesaj..."
                disabled={isLoading}
                rows={1}
                aria-label="Mesaj către terapeut"
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
              className="send-button"
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

        {/* Disclaimer text - only shown before first message */}
        {!hasStartedConversation && (
          <div className={`disclaimer-text ${!hasStartedConversation ? '' : 'hidden'}`}>
            {currentTherapist.name} este un instrument de suport, nu un înlocuitor pentru terapia profesională.
          </div>
        )}
      </div>
    </div>
  );
}