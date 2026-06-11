import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

export function getSocket(anonymousId: string): Socket {
  if (socket && socket.connected) return socket;
  if (socket) { socket.disconnect(); socket = null; }
  socket = io(SOCKET_URL, {
    auth: { anonymousId },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    timeout: 10_000,
  });
  return socket;
}

export function disconnectSocket(): void {
  if (socket) { socket.disconnect(); socket = null; }
}
