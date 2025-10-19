import { useEffect, useRef, useState } from 'react';

export function usePolling(callback, interval = 5000, enabled = true) {
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
      return;
    }

    const poll = async () => {
      try {
        setIsPolling(true);
        setError(null);
        await callbackRef.current();
      } catch (err) {
        console.error('Polling error:', err);
        setError(err.message || 'Polling failed');
      } finally {
        setIsPolling(false);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
    };
  }, [enabled, interval]);

  return {
    isPolling,
    error,
    stopPolling: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
    },
    startPolling: () => {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(async () => {
          try {
            setIsPolling(true);
            setError(null);
            await callbackRef.current();
          } catch (err) {
            console.error('Polling error:', err);
            setError(err.message || 'Polling failed');
          } finally {
            setIsPolling(false);
          }
        }, interval);
      }
    }
  };
}
