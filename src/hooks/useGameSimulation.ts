import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Attempt, BestApproximation } from '../types/game';
import { calculateSemanticRankFromSimilarity, cosineSimilarity } from '../utils/semantic';

const INITIAL_STATE: GameState = {
  secretWord: '',
  status: 'idle',
  attempts: [],
  bestApproximations: [],
  players: [],
  winners: [],
  tieBreakerScores: {},
};

export function useGameSimulation(userId?: string) {
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

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Sincronizar estado con Firebase cada vez que cambia
  useEffect(() => {
    // Mantener sincronizado en la base de datos de Firebase
    if (userId && (gameState.status !== 'idle' || gameState.attempts.length > 0)) {
      import('firebase/database').then(({ ref, set }) => {
        import('../lib/firebase').then(({ db }) => {
          set(ref(db, `users/${userId}/gameState`), gameState).catch(console.error);
        });
      });
    }
  }, [gameState, userId]);

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
    if (!w) return;

    if (gameState.status === 'tie_breaker') {
      // In tie breaker mode, any message from tied players gives them points
      setGameState((prev) => {
        if (prev.status !== 'tie_breaker' || !prev.winners?.includes(user)) return prev;
        const tieBreakerScores = { ...prev.tieBreakerScores };
        tieBreakerScores[user] = (tieBreakerScores[user] || 0) + 1;
        
        // Let's say 20 points wins
        if (tieBreakerScores[user] >= 20) {
          return {
            ...prev,
            status: 'won',
            winners: [user], // Sole winner now
            tieBreakerScores,
          };
        }
        
        return {
          ...prev,
          tieBreakerScores,
        };
      });
      return;
    }

    if (gameState.status !== 'playing' && gameState.status !== 'pending_win') return;

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

      const newAttempts = [...prev.attempts, attempt].slice(-10); // KEEP LAST 10 MAX

      if (rank === 1) {
        if (prev.status === 'playing') {
          return {
            ...prev,
            attempts: newAttempts,
            status: 'pending_win',
            winTime: Date.now(),
            winners: [user],
          };
        } else if (prev.status === 'pending_win') {
          if (!prev.winners?.includes(user)) {
            return {
              ...prev,
              attempts: newAttempts,
              winners: [...(prev.winners || []), user],
            };
          }
          return {
            ...prev,
            attempts: newAttempts,
          };
        }
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

  // Handle 5-second pending_win window
  useEffect(() => {
    if (gameState.status === 'pending_win' && gameState.winTime) {
      const elapsed = Date.now() - gameState.winTime;
      const remaining = 5000 - elapsed;

      if (remaining <= 0) {
        setGameState((prev) => {
          if (prev.status !== 'pending_win') return prev;
          const isTie = (prev.winners?.length || 0) > 1;
          
          if (isTie) {
            const initialScores: Record<string, number> = {};
            prev.winners?.forEach(w => { initialScores[w] = 0; });
            return { ...prev, status: 'tie_breaker', tieBreakerScores: initialScores };
          } else {
            return { ...prev, status: 'won' };
          }
        });
      } else {
        const timeout = setTimeout(() => {
          setGameState((prev) => {
            if (prev.status !== 'pending_win') return prev;
            const isTie = (prev.winners?.length || 0) > 1;
            
            if (isTie) {
              const initialScores: Record<string, number> = {};
              prev.winners?.forEach(w => { initialScores[w] = 0; });
              return { ...prev, status: 'tie_breaker', tieBreakerScores: initialScores };
            } else {
              return { ...prev, status: 'won' };
            }
          });
        }, remaining);
        return () => clearTimeout(timeout);
      }
    }
  }, [gameState.status, gameState.winTime, gameState.winners]);

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
