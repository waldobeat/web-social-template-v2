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
    // Listen to updates from Dashboard
    const channel = new BroadcastChannel('sheddit_state');
    
    channel.onmessage = (event) => {
      if (event.data?.type === 'STATE_UPDATE') {
        setGameState(event.data.payload);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-transparent overflow-hidden">
      <GamePanel gameState={gameState} />
    </div>
  );
}
