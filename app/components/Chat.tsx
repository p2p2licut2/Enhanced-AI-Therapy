// app/components/Chat.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [inputHeight, setInputHeight] = useState(0);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  // Scroll to top function
  const scrollToTop = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to bottom for assistant messages
  useEffect(() => {
    if (messages.length > 0) {
      const scrollToEnd = () => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          });
        }
      };
      
      // Small delay to ensure layout has settled
      setTimeout(scrollToEnd, 100);
    }
  }, [messages, isLoading]);

  // Animate assistant messages
  const animateText = (text: string) => {
    setIsAnimating(true);
    let currentIndex = 0;

    // Function to add characters gradually
    const addCharacters = () => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.substring(0, currentIndex));
        currentIndex += 5; // Add 5 characters at a time for speed
        setTimeout(addCharacters, 20);
      } else {
        setIsAnimating(false);
      }
    };

    // Start animation
    addCharacters();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
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
      // Prepare message data for API
      const messageData = [
        ...messages,
        userMessage
      ].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messageData,
          therapistId: currentTherapist.id
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      // Add assistant response and animate
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
        displayed: false // Initially not fully displayed
      };

      // Add the message and start animation
      addMessage(assistantMessage);
      animateText(data.content);

    } catch (error) {
      console.error('Error:', error);

      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Îmi pare rău, am întâmpinat o eroare. Te rog să încerci din nou.',
        displayed: true
      };

      addMessage(errorMessage);
    } finally {
      setIsLoading(false);

      // Ensure consistent input box height
      if (textareaRef.current) {
        setTimeout(() => {
          if (textareaRef.current) {
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
    <div className="chat-window" ref={chatWindowRef}>
      {/* Messages */}
      <div
        className="messages-container"
        ref={messagesContainerRef}
        style={{
          height: `calc(100% - ${inputHeight}px)`,
          paddingBottom: '16px'
        }}
      >
        {messages.length === 0 ? (
          // Welcome message when no messages exist
          <div className="welcome-container">
            <div className="welcome-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="welcome-title">Bine ai venit la sesiunea ta de terapie</p>
            <p className="welcome-text">
              Întreabă-mă despre dezvoltare personală, stabilirea obiectivelor sau orice provocări cu care te confrunți
            </p>
          </div>
        ) : (
          // Message list
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`message-bubble ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}>
                {message.role === 'assistant' && index === messages.length - 1 && isAnimating ? (
                  // If it's the last assistant message and it's animating
                  <span className="typing-animation">{displayedText}</span>
                ) : (
                  // Otherwise, display the message normally
                  formatMessage(message.content)
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="message-bubble message-assistant loading-indicator">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
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
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Scrie un mesaj..."
                disabled={isLoading}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="send-button"
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                className="w-4 h-4"
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