import { useEffect, useRef, useState, useCallback } from 'react';

export function useDebouncedPolling(callback, interval = 5000, enabled = true, debounceMs = 1000) {
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  const isPollingRef = useRef(false);
  const lastPollTimeRef = useRef(0);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const poll = useCallback(async () => {
    const now = Date.now();
    
    // Prevent overlapping polls
    if (isPollingRef.current) {
      console.log('Polling already in progress, skipping...');
      return;
    }

    // Debounce: don't poll if we've polled recently
    if (now - lastPollTimeRef.current < debounceMs) {
      console.log('Polling debounced, too recent...');
      return;
    }

    try {
      isPollingRef.current = true;
      setIsPolling(true);
      setError(null);
      lastPollTimeRef.current = now;
      await callbackRef.current();
    } catch (err) {
      console.error('Polling error:', err);
      setError(err.message || 'Polling failed');
    } finally {
      isPollingRef.current = false;
      setIsPolling(false);
    }
  }, [debounceMs]);

  const startPolling = useCallback(() => {
    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    // Initial poll with debounce
    debounceTimeoutRef.current = setTimeout(() => {
      poll();
    }, debounceMs);

    // Set up interval for subsequent polls
    intervalRef.current = setInterval(() => {
      // Add debounce to interval polls too
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        poll();
      }, debounceMs);
    }, interval);
  }, [poll, interval, debounceMs]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    isPollingRef.current = false;
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isPolling,
    error,
    stopPolling,
    startPolling
  };
}
