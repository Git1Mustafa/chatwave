'use client';
import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/lib/socket';
import { getOrCreateAnonymousId } from '@/lib/idGenerator';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const anonId = getOrCreateAnonymousId();
    setAnonymousId(anonId);
    const sock = getSocket(anonId);
    socketRef.current = sock;

    sock.on('connect', () => { setIsConnected(true); setConnectionError(null); });
    sock.on('disconnect', () => setIsConnected(false));
    sock.on('connect_error', (err) => {
      setIsConnected(false);
      setConnectionError(err.message.includes('BANNED') ? 'Your account has been banned.' : 'Cannot connect to server. Try again.');
    });

    if (sock.connected) setIsConnected(true);
    return () => { sock.off('connect'); sock.off('disconnect'); sock.off('connect_error'); };
  }, []);

  return { socket: socketRef.current, isConnected, anonymousId, connectionError };
}
