export interface GameSession {
  id: string;
  player1: Player;
  player2: Player;
  startTime: number;
  endTime?: number;
  messages: Message[];
  status: 'waiting' | 'active' | 'finished';
}

export interface Player {
  id: string;
  socketId: string;
  isHuman: boolean;
  score: number;
  guess?: 'human' | 'bot';
  correct?: boolean;
}

export interface Message {
  id: string;
  playerId: string;
  content: string;
  timestamp: number;
}

export interface QueuePlayer {
  id: string;
  socketId: string;
  isHuman: boolean;
  joinTime: number;
}

