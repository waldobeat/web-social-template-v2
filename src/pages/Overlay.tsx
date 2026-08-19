import { useEffect, useState } from 'react';
import GamePanel from '../components/GamePanel';
import type { GameState } from '../types/game';

const INITIAL_STATE: GameState = {
  secretWord: '',
  status: 'idle',
  attempts: [],
  bestApproximations: [],
  players: [],
};

export default function Overlay() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  useEffect(() => {
    // Listen to updates from Firebase Realtime Database
    let unsubscribe = () => {};
    
    import('firebase/database').then(({ ref, onValue }) => {
      import('../lib/firebase').then(({ db }) => {
        const stateRef = ref(db, 'sheddit/gameState');
        unsubscribe = onValue(stateRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Ensure attempts and bestApproximations are arrays even if empty in Firebase
            setGameState({
              ...INITIAL_STATE,
              ...data,
              attempts: data.attempts || [],
              bestApproximations: data.bestApproximations || [],
              players: data.players || []
            });
          }
        });
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-transparent overflow-hidden">
      <GamePanel gameState={gameState} />
    </div>
  );
}
