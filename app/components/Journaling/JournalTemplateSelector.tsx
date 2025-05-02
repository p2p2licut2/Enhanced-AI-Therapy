'use client';

// app/components/Journaling/JournalTemplateSelector.tsx
import React from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { JournalTemplateId } from '@/app/types';
import styles from './JournalTemplateSelector.module.css';

interface JournalTemplateSelectorProps {
  onSelectTemplate: (templateId: JournalTemplateId) => void;
}

export default function JournalTemplateSelector({ onSelectTemplate }: JournalTemplateSelectorProps) {
  const { journalTemplates } = useApp();

  // Icon components for template cards
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'heart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'star':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'moon':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
    }
  };

  return (
    <div className={styles.templateContainer}>
      {journalTemplates.map((template) => (
        <div 
          key={template.id}
          className={styles.templateCard}
          onClick={() => onSelectTemplate(template.id)}
          style={{ 
            '--template-color': template.color
          } as React.CSSProperties}
        >
          <div className={styles.iconContainer}>
            {getIconComponent(template.icon)}
          </div>
          <div className={styles.templateContent}>
            <h4 className={styles.templateTitle}>{template.name}</h4>
            <p className={styles.templateDescription}>{template.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}