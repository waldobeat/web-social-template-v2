export type GameStatus = 'idle' | 'playing' | 'won';

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