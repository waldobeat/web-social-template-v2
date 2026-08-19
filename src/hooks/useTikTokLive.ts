import { useState, useCallback } from 'react';

interface UseTikTokLiveOptions {
  onChat?: (username: string, comment: string, isMod: boolean) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (err: Error) => void;
}

export function useTikTokLive(username: string, options: UseTikTokLiveOptions) {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  const connect = useCallback(async () => {
    if (!username) return;
    setStatus('connecting');
    
    // Simular conexión
    setTimeout(() => {
      if (username.length > 3) {
        setStatus('connected');
        options.onConnect?.();
      } else {
        setStatus('error');
        options.onError?.(new Error('Invalid username'));
      }
    }, 1500);
  }, [username, options]);

  const disconnect = useCallback(() => {
    setStatus('disconnected');
    options.onDisconnect?.();
  }, [options]);

  return { status, connect, disconnect };
}
