import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  const { userId } = useParams<{ userId: string }>();
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  useEffect(() => {
    if (!userId) return;

    // Listen to updates from Firebase Realtime Database
    let unsubscribe = () => {};
    
    import('firebase/database').then(({ ref, onValue }) => {
      import('../lib/firebase').then(({ db }) => {
        const stateRef = ref(db, `users/${userId}/gameState`);
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
    <div className="h-screen w-screen bg-transparent overflow-hidden touch-none fixed inset-0">
      <GamePanel gameState={gameState} />
    </div>
  );
}
