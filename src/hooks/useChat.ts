'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io-client';
import type { ChatStatus, ChatItem, MatchFoundPayload, MessageReceivedPayload, StrangerTypingPayload, StrangerDisconnectedPayload, ReportPayload } from '@/types';

export function useChat(socket: Socket | null, anonymousId: string | null) {
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [items, setItems] = useState<ChatItem[]>([]);
  const [strangerAnonymousId, setStrangerAnon] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isStrangerTyping, setStrangerTyping] = useState(false);
  const roomIdRef = useRef<string | null>(null);
  const anonIdRef = useRef<string | null>(null);

  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
  useEffect(() => { anonIdRef.current = anonymousId; }, [anonymousId]);

  const addSystem = useCallback((text: string) => {
    setItems(prev => [...prev, { type: 'system', data: { id: uuidv4(), text, timestamp: new Date().toISOString() } }]);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onWaiting = () => setStatus('waiting');
    const onMatchFound = (p: MatchFoundPayload) => {
      setStatus('matched'); setRoomId(p.roomId); setStrangerAnon(p.strangerAnonymousId);
      setItems([]); setStrangerTyping(false);
      addSystem('You are now chatting with a stranger. Say hi!');
    };
    const onMessage = (p: MessageReceivedPayload) => {
      const isMine = p.senderId === anonIdRef.current;
      setItems(prev => [...prev, { type: 'message', data: { ...p, isMine } }]);
      if (!isMine) setStrangerTyping(false);
    };
    const onTyping = (p: StrangerTypingPayload) => setStrangerTyping(p.isTyping);
    const onDisconnected = (p: StrangerDisconnectedPayload) => {
      setStatus('disconnected'); setStrangerTyping(false);
      addSystem(p.reason === 'skip' ? 'Stranger skipped.' : 'Stranger disconnected.');
    };
    const onError = (p: { message: string }) => addSystem(`⚠️ ${p.message}`);

    socket.on('waiting', onWaiting);
    socket.on('match_found', onMatchFound);
    socket.on('message_received', onMessage);
    socket.on('stranger_typing', onTyping);
    socket.on('stranger_disconnected', onDisconnected);
    socket.on('error', onError);
    return () => {
      socket.off('waiting', onWaiting); socket.off('match_found', onMatchFound);
      socket.off('message_received', onMessage); socket.off('stranger_typing', onTyping);
      socket.off('stranger_disconnected', onDisconnected); socket.off('error', onError);
    };
  }, [socket, addSystem]);

  const startChat = useCallback(() => {
    if (!socket || !anonymousId) return;
    setStatus('connecting');
    socket.emit('join_queue', { anonymousId });
  }, [socket, anonymousId]);

  const sendMessage = useCallback((content: string) => {
    if (!socket || !roomIdRef.current || !content.trim()) return;
    socket.emit('send_message', { content: content.trim(), roomId: roomIdRef.current });
  }, [socket]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socket || !roomIdRef.current) return;
    socket.emit('typing', { roomId: roomIdRef.current, isTyping });
  }, [socket]);

  const skip = useCallback(() => {
    if (!socket) return;
    if (roomIdRef.current) socket.emit('skip', { roomId: roomIdRef.current });
    setStatus('connecting'); setRoomId(null); setStrangerAnon(null); setStrangerTyping(false);
    if (anonymousId) socket.emit('join_queue', { anonymousId });
  }, [socket, anonymousId]);

  const findNew = useCallback(() => {
    if (!socket) return;
    if (roomIdRef.current) socket.emit('skip', { roomId: roomIdRef.current });
    setStatus('connecting'); setRoomId(null); setStrangerAnon(null); setItems([]); setStrangerTyping(false);
    if (anonymousId) socket.emit('join_queue', { anonymousId });
  }, [socket, anonymousId]);

  const disconnect = useCallback(() => {
    if (!socket) return;
    if (roomIdRef.current) socket.emit('skip', { roomId: roomIdRef.current });
    socket.emit('leave_queue');
    setStatus('idle'); setRoomId(null); setStrangerAnon(null); setItems([]); setStrangerTyping(false);
  }, [socket]);

  const reportStranger = useCallback((payload: Omit<ReportPayload, 'roomId'>) => {
    if (!socket || !roomIdRef.current) return;
    socket.emit('report_user', { ...payload, roomId: roomIdRef.current });
  }, [socket]);

  const blockStranger = useCallback(() => {
    if (!socket || !strangerAnonymousId) return;
    socket.emit('block_user', { blockedAnonymousId: strangerAnonymousId });
  }, [socket, strangerAnonymousId]);

  return { status, items, strangerAnonymousId, roomId, isStrangerTyping, startChat, sendMessage, sendTyping, skip, findNew, disconnect, reportStranger, blockStranger };
}
