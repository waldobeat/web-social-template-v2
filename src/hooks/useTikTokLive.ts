import { useState, useEffect, useRef, useCallback } from 'react';
import { TikTokLiveConnection, ControlEvent, WebcastEvent } from 'tiktok-live-connector';

interface UseTikTokLiveOptions {
  onChat?: (username: string, comment: string, isMod: boolean) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (err: Error) => void;
}

export function useTikTokLive(username: string, options: UseTikTokLiveOptions) {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const connectionRef = useRef<TikTokLiveConnection | null>(null);

  const connect = useCallback(async () => {
    if (!username) return;
    
    try {
      setStatus('connecting');
      
      if (connectionRef.current) {
        connectionRef.current.disconnect();
      }

      const tiktokLiveConnection = new TikTokLiveConnection(username, {
        processInitialData: false,
        enableExtendedGiftInfo: false,
      });

      tiktokLiveConnection.on(ControlEvent.DISCONNECTED, () => {
        console.log('Disconnected from TikTok LIVE');
        setStatus('disconnected');
        options.onDisconnect?.();
      });

      tiktokLiveConnection.on(WebcastEvent.CHAT, (data: any) => {
        const isMod = data.user?.isModerator || false;
        const comment = data.comment || '';
        const uniqueId = data.user?.uniqueId || 'unknown';
        options.onChat?.(uniqueId, comment, isMod);
      });

      tiktokLiveConnection.on(ControlEvent.ERROR, (err: any) => {
        console.error('TikTok LIVE Error:', err);
        setStatus((prev) => prev === 'connecting' ? 'error' : prev);
        options.onError?.(err);
      });

      await tiktokLiveConnection.connect();
      console.log('Connected to TikTok LIVE');
      setStatus('connected');
      options.onConnect?.();

      connectionRef.current = tiktokLiveConnection;
      
    } catch (err: any) {
      console.error('Failed to connect to TikTok:', err);
      setStatus('error');
      options.onError?.(err);
    }
  }, [username, options]);

  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.disconnect();
      connectionRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { status, connect, disconnect };
}
