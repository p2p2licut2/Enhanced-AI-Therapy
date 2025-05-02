'use client';

// app/components/Journaling/JournalEntry.tsx
import React, { useState, useEffect } from 'react';
import styles from './JournalEntry.module.css';
import { JournalTemplate } from '@/app/types';

interface JournalEntryProps {
  content: string;
  onContentChange: (content: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  template?: JournalTemplate | null;
}

export default function JournalEntry({ 
  content, 
  onContentChange, 
  textareaRef,
  template
}: JournalEntryProps) {
  const [currentContent, setCurrentContent] = useState(content);
  const [showPrompts, setShowPrompts] = useState(!content || content.trim().length === 0);
  
  // Update local content when prop changes
  useEffect(() => {
    setCurrentContent(content);
  }, [content]);
  
  // Check if content is empty to show prompts
  useEffect(() => {
    setShowPrompts(!currentContent || currentContent.trim().length === 0);
  }, [currentContent]);
  
  // Handle content change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setCurrentContent(newContent);
    onContentChange(newContent);
  };
  
  // Auto resize textarea
  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  
  // Handle prompt click
  const handlePromptClick = (prompt: string) => {
    // If content is empty, just set the prompt as content
    if (!currentContent || currentContent.trim().length === 0) {
      const newContent = `${prompt}\n\n`;
      setCurrentContent(newContent);
      onContentChange(newContent);
    } else {
      // If content exists, add prompt at the end with appropriate spacing
      const newContent = `${currentContent.trim()}\n\n${prompt}\n\n`;
      setCurrentContent(newContent);
      onContentChange(newContent);
    }
    
    // Focus textarea after adding prompt
    if (textareaRef?.current) {
      textareaRef.current.focus();
      
      // Place cursor at the end
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
      
      // Trigger auto resize
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  return (
    <div className={styles.journalEntryContainer}>
      <div className={styles.textareaWrapper}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={currentContent}
          onChange={(e) => {
            handleChange(e);
            autoResize(e);
          }}
          placeholder="Începe să scrii..."
          rows={10}
        />
      </div>
      
      {showPrompts && template && (
        <div className={styles.promptsContainer}>
          <h3 className={styles.promptsTitle}>Întrebări pentru reflecție</h3>
          <div className={styles.promptsList}>
            {template.prompts.map((prompt, index) => (
              <button
                key={index}
                className={styles.promptButton}
                onClick={() => handlePromptClick(prompt)}
                style={{ 
                  '--prompt-color': template.color
                } as React.CSSProperties}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}