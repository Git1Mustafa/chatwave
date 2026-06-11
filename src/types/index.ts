export type ChatStatus = 'idle' | 'connecting' | 'waiting' | 'matched' | 'disconnected' | 'error';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  roomId: string;
  timestamp: string;
  isMine: boolean;
}

export interface SystemMessage {
  id: string;
  text: string;
  timestamp: string;
}

export type ChatItem =
  | { type: 'message'; data: Message }
  | { type: 'system'; data: SystemMessage };

export interface MatchFoundPayload { roomId: string; strangerAnonymousId: string; }
export interface MessageReceivedPayload { id: string; content: string; senderId: string; roomId: string; timestamp: string; }
export interface StrangerTypingPayload { isTyping: boolean; }
export interface StrangerDisconnectedPayload { reason: 'skip' | 'disconnect'; }

export type ReportReason = 'spam' | 'harassment' | 'inappropriate_content' | 'hate_speech' | 'underage' | 'other';

export interface ReportPayload {
  reportedAnonymousId: string;
  roomId: string;
  reason: ReportReason;
  description?: string;
}
