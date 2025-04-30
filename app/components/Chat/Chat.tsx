'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { Message } from '@/app/types';

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

  // Animate assistant messages - simplified for CSS animation
  useEffect(() => {
    if (isAnimating && messages.length > 0) {
      // Set a timeout to mark animation as complete after a reasonable time
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          setIsAnimating(false);
        }
      }, 2000); // Adjust based on your animation duration
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAnimating, messages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Set conversation started state
    if (!hasStartedConversation) {
      setHasStartedConversation(true);
    }

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
                  className={`message-bubble ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
                >
                  {isLastAssistantMessage ? (
                    // If it's the last assistant message and it's animating
                    <div className="typing-animation-container">
                      <div className="typing-animation">
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