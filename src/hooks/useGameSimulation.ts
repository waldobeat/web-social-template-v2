import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Attempt, BestApproximation } from '../types/game';
import { calculateSemanticRankFromSimilarity, cosineSimilarity } from '../utils/semantic';

const INITIAL_STATE: GameState = {
  secretWord: '',
  status: 'idle',
  attempts: [],
  bestApproximations: [],
  players: [],
};

export function useGameSimulation() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  
  // Cache of embeddings to avoid re-calculating for same words
  const embeddingsCache = useRef<Map<string, number[]>>(new Map());
  const pendingRequests = useRef<Map<string, (embedding: number[]) => void>>(new Map());
  
  const secretEmbedding = useRef<number[] | null>(null);

  useEffect(() => {
    // Inicializar el Web Worker para transformers.js
    workerRef.current = new Worker(new URL('../utils/embeddingWorker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'ready') {
        setIsEngineReady(true);
      } else if (type === 'embedding') {
        const { id, word, embedding } = payload;
        embeddingsCache.current.set(word, embedding);
        const resolve = pendingRequests.current.get(id);
        if (resolve) {
          resolve(embedding);
          pendingRequests.current.delete(id);
        }
      } else if (type === 'error') {
        console.error('Embedding worker error:', payload);
      }
    };

    workerRef.current.postMessage({ type: 'init' });

    // Eliminar o comentar temporalmente BroadcastChannel si se quiere usar solo Firebase
    // broadcastRef.current = new BroadcastChannel('sheddit_state');

    return () => {
      workerRef.current?.terminate();
      // broadcastRef.current?.close();
    };
  }, []);

  // Sincronizar estado con Firebase cada vez que cambia
  useEffect(() => {
    // Mantener sincronizado en la base de datos de Firebase
    if (gameState.status !== 'idle' || gameState.attempts.length > 0) {
      import('firebase/database').then(({ ref, set }) => {
        import('../lib/firebase').then(({ db }) => {
          set(ref(db, 'sheddit/gameState'), gameState).catch(console.error);
        });
      });
    }
  }, [gameState]);

  const getEmbedding = useCallback((word: string): Promise<number[]> => {
    return new Promise((resolve) => {
      const cached = embeddingsCache.current.get(word);
      if (cached) {
        resolve(cached);
        return;
      }
      
      const id = crypto.randomUUID();
      pendingRequests.current.set(id, resolve);
      workerRef.current?.postMessage({ type: 'embed', payload: { word, id } });
    });
  }, []);

  const startGame = useCallback(async (secretWord: string) => {
    setGameState({
      secretWord,
      status: 'playing',
      attempts: [],
      bestApproximations: [],
      players: [],
    });
    
    // Calcular y guardar el embedding de la palabra secreta
    const embedding = await getEmbedding(secretWord.toLowerCase().trim());
    secretEmbedding.current = embedding;
  }, [getEmbedding]);

  const addAttempt = useCallback(async (word: string, user: string, isMod: boolean) => {
    const w = word.toLowerCase().trim();
    if (!w || gameState.status !== 'playing') return;

    // Si todavía no tenemos el embedding de la palabra secreta, esperar
    if (!secretEmbedding.current) return;

    let rank = 1;
    if (w !== gameState.secretWord.toLowerCase().trim()) {
      const wordEmb = await getEmbedding(w);
      const similarity = cosineSimilarity(secretEmbedding.current, wordEmb);
      rank = calculateSemanticRankFromSimilarity(similarity);
    }

    setGameState((prev) => {
      if (prev.status !== 'playing') return prev;

      const attempt: Attempt = {
        id: crypto.randomUUID(),
        word,
        rank,
        timestamp: Date.now(),
        user,
        isMod,
      };

      const newAttempts = [...prev.attempts, attempt];

      if (rank === 1) {
        const bestMap = new Map<string, BestApproximation>();
        prev.bestApproximations.forEach((b) => bestMap.set(b.word, b));
        bestMap.set(word, { word, rank, user, position: 1 });

        const sorted = Array.from(bestMap.values())
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 10)
          .map((b, i) => ({ ...b, position: i + 1 }));

        return {
          ...prev,
          attempts: newAttempts,
          bestApproximations: sorted,
          status: 'won',
        };
      }

      const bestMap = new Map<string, BestApproximation>();
      prev.bestApproximations.forEach((b) => bestMap.set(b.word, b));

      const existing = bestMap.get(word);
      if (!existing || rank < existing.rank) {
        bestMap.set(word, { word, rank, user, position: 0 });
      }

      const sorted = Array.from(bestMap.values())
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 10)
        .map((b, i) => ({ ...b, position: i + 1 }));

      return {
        ...prev,
        attempts: newAttempts,
        bestApproximations: sorted,
      };
    });
  }, [gameState.status, gameState.secretWord, getEmbedding]);

  const resetGame = useCallback(() => {
    setGameState(INITIAL_STATE);
    secretEmbedding.current = null;
  }, []);

  const botGuess = useCallback((botName: string, word: string) => {
    const isMod = botName.startsWith('Moderador');
    addAttempt(word, botName, isMod);
  }, [addAttempt]);

  return {
    gameState,
    isEngineReady,
    startGame,
    addAttempt,
    resetGame,
    botGuess,
  };
}