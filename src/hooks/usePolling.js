import { useEffect, useRef, useState, useCallback } from 'react';

export function usePolling(callback, interval = 5000, enabled = true) {
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  const isPollingRef = useRef(false);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const poll = useCallback(async () => {
    // Prevent overlapping polls
    if (isPollingRef.current) {
      console.log('Polling already in progress, skipping...');
      return;
    }

    try {
      isPollingRef.current = true;
      setIsPolling(true);
      setError(null);
      await callbackRef.current();
    } catch (err) {
      console.error('Polling error:', err);
      setError(err.message || 'Polling failed');
    } finally {
      isPollingRef.current = false;
      setIsPolling(false);
    }
  }, []);

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

    // Initial poll
    poll();

    // Set up interval for subsequent polls
    intervalRef.current = setInterval(poll, interval);
  }, [poll, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
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
