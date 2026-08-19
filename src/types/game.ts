export type GameStatus = 'idle' | 'playing' | 'pending_win' | 'tie_breaker' | 'won';

export interface Attempt {
  id: string;
  word: string;
  rank: number;
  timestamp: number;
  user: string;
  isMod: boolean;
}

export interface BestApproximation {
  word: string;
  rank: number;
  user: string;
  position: number;
}

export interface GameState {
  secretWord: string;
  status: GameStatus;
  attempts: Attempt[];
  bestApproximations: BestApproximation[];
  players: Player[];
  winners?: string[];
  tieBreakerScores?: Record<string, number>;
  winTime?: number;
}

export interface Player {
  id: string;
  name: string;
  isMod: boolean;
  score: number;
}

export interface BotConfig {
  name: string;
  isMod: boolean;
  words: string[];
}
