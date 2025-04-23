// app/hooks/useSafeAsync.ts
import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook to safely handle asynchronous operations and prevent memory leaks
 * when components unmount before async operations complete
 */
export function useSafeAsync() {
  const mountedRef = useRef<boolean>(true);
  
  // Helper to check if component is still mounted
  const isMounted = useCallback(() => mountedRef.current, []);
  
  // Create a safe version of setState that only updates state if component is mounted
  const safeDispatch = useCallback(<T>(fn: () => void): void => {
    if (isMounted()) {
      fn();
    }
  }, [isMounted]);
  
  // Wraps an async function to be safely executed
  const safeAsync = useCallback(<T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    return new Promise((resolve) => {
      asyncFn()
        .then((result) => {
          if (isMounted()) {
            resolve(result);
          } else {
            resolve(null);
          }
        })
        .catch((error) => {
          // Only log errors if component is still mounted
          if (isMounted()) {
            console.error('Async error:', error);
            resolve(null);
          } else {
            resolve(null);
          }
        });
    });
  }, [isMounted]);
  
  // Track mounted state for cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  return { isMounted, safeDispatch, safeAsync };
}

/**
 * Hook to create an AbortController that automatically aborts when component unmounts
 * or when dependencies change
 */
export function useAbortController(dependencies: React.DependencyList = []) {
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Create a new controller and abort any existing ones
  const getAbortController = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  }, []);
  
  // Cleanup on unmount or when dependencies change
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, dependencies);
  
  return { getAbortController, signal: getAbortController().signal };
}

/**
 * Hook to manage cancelable timeouts that are automatically cleared on unmount
 */
export function useTimeout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear any existing timeout
  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  // Set a new timeout that is automatically cleared on unmount
  const setTimeout = useCallback((callback: () => void, delay: number) => {
    clearTimer();
    timeoutRef.current = global.setTimeout(callback, delay);
    return timeoutRef.current;
  }, [clearTimer]);
  
  // Cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);
  
  return { setTimeout, clearTimer };
}

export default useSafeAsync;