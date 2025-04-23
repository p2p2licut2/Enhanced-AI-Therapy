'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import useSafeAsync, { useTimeout } from '../hooks/useSafeAsync';

interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
}

/**
 * FocusTrap - Traps focus within a component (like a modal) for accessibility
 * This ensures keyboard navigation stays within the trapped component
 */
export default function FocusTrap({ children, isActive }: FocusTrapProps) {
  // Safety hooks - MUST COME BEFORE OTHER HOOKS
  const { isMounted } = useSafeAsync();
  const { setTimeout: safeSetTimeout } = useTimeout();
  
  // Store the element that had focus before this trap activated
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
    return elements.filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
  }, []);

  // Set up focus trap
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Handle tab key presses to keep focus within the container
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If shift + tab and we're on the first element, move to the last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } 
      // If tab and we're on the last element, move to the first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);

      // Restore focus when trap is deactivated
      if (previousActiveElement.current && isMounted()) {
        safeSetTimeout(() => {
          if (previousActiveElement.current && isMounted()) {
            previousActiveElement.current.focus();
            previousActiveElement.current = null;
          }
        }, 0);
      }
    };
  }, [isActive, getFocusableElements, isMounted, safeSetTimeout]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}