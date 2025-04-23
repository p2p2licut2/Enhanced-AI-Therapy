// app/hooks/useAutoScroll.ts
import { useEffect, useRef } from 'react';

interface UseAutoScrollOptions {
  speed?: number;
  interval?: number;
  pauseAtEnd?: number;
  resetOnManualScroll?: boolean;
}

/**
 * Custom hook for automatic horizontal scrolling with pause at the end
 * @param isActive Whether auto-scrolling should be active
 * @param options Configuration options
 * @returns Object with scroll controls and refs
 */
const useAutoScroll = <T extends HTMLElement>(
  isActive: boolean,
  options: UseAutoScrollOptions = {}
) => {
  const {
    speed = 1,
    interval = 20,
    pauseAtEnd = 2000,
    resetOnManualScroll = true
  } = options;
  
  // Refs
  const elementRef = useRef<T | null>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Internal state refs (using refs instead of state to avoid re-renders)
  const isScrollingRef = useRef(isActive);
  const manualScrollActiveRef = useRef(false);
  const lastKnownScrollPositionRef = useRef(0);
  
  // Clear all timers
  const clearTimers = () => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
    if (resetScrollTimerRef.current) {
      clearTimeout(resetScrollTimerRef.current);
      resetScrollTimerRef.current = null;
    }
  };

  // Set up scrolling
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    
    isScrollingRef.current = isActive;
    
    // Only start auto-scrolling if active and content is wider than container
    if (isActive && el.scrollWidth > el.clientWidth) {
      clearTimers();
      
      // Save initial position
      lastKnownScrollPositionRef.current = el.scrollLeft;
      
      // Start scrolling interval
      let position = el.scrollLeft;
      autoScrollTimerRef.current = setInterval(() => {
        // Bail if element is no longer in the DOM
        if (!el || !document.contains(el)) {
          clearTimers();
          return;
        }
        
        // Check if scroll position changed outside this interval (manual scroll)
        if (Math.abs(el.scrollLeft - lastKnownScrollPositionRef.current) > 1 && 
            el.scrollLeft !== position) {
          // User scrolled manually - stop auto-scrolling
          clearTimers();
          isScrollingRef.current = false;
          manualScrollActiveRef.current = true;
          return;
        }
        
        // Increment position
        position += speed;
        lastKnownScrollPositionRef.current = position;
        
        // If we've reached the end, pause then reset
        if (position >= el.scrollWidth - el.clientWidth) {
          clearTimers();
          
          // Set timer to reset to beginning after a pause
          resetScrollTimerRef.current = setTimeout(() => {
            // Only scroll back if element is still in DOM
            if (el && document.contains(el)) {
              // Smoothly scroll back to start
              el.scrollTo({
                left: 0,
                behavior: 'smooth'
              });
            }
            
            // Stop auto-scrolling
            isScrollingRef.current = false;
          }, pauseAtEnd);
        } else {
          // Apply the scroll position
          el.scrollLeft = position;
        }
      }, interval);
    } else if (!isActive) {
      // If turning off auto-scrolling, reset scroll position
      if (el) {
        el.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }
      clearTimers();
    }
    
    return clearTimers;
  }, [isActive, speed, interval, pauseAtEnd]);
  
  // Effect to detect manual scroll and handle scroll events
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    
    const handleManualScroll = () => {
      if (isScrollingRef.current) {
        isScrollingRef.current = false;
        clearTimers();
      }
      
      // Mark that user has scrolled manually
      manualScrollActiveRef.current = true;
    };
    
    // Detect various scroll events
    el.addEventListener('wheel', handleManualScroll, { passive: true });
    el.addEventListener('touchmove', handleManualScroll, { passive: true });
    
    // Debounced scroll listener
    let scrollTimeout: NodeJS.Timeout | null = null;
    const debouncedScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleManualScroll, 50);
    };
    
    el.addEventListener('scroll', debouncedScroll, { passive: true });
    
    return () => {
      el.removeEventListener('wheel', handleManualScroll);
      el.removeEventListener('touchmove', handleManualScroll);
      el.removeEventListener('scroll', debouncedScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);
  
  // Return interface methods to control scrolling
  const setIsScrolling = (value: boolean) => {
    isScrollingRef.current = value;
    if (!value) {
      clearTimers();
      
      const el = elementRef.current;
      if (el) {
        el.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }
    }
  };
  
  const setManualScrollActive = (value: boolean) => {
    manualScrollActiveRef.current = value;
  };
  
  return {
    elementRef,
    get isScrolling() { return isScrollingRef.current; },
    setIsScrolling,
    get manualScrollActive() { return manualScrollActiveRef.current; },
    setManualScrollActive,
  };
};

export default useAutoScroll;