import type { GameState } from '../types/game';
import AttemptsList from './AttemptsList';
import BestApproximations from './BestApproximations';
import GameStatus from './GameStatus';
import RulesPanel from './RulesPanel';

interface GamePanelProps {
  gameState: GameState;
}

export default function GamePanel({ gameState }: GamePanelProps) {
  const { status, attempts, bestApproximations, secretWord } = gameState;

  return (
    <div className="vertical-overlay bg-concrete">
      <div className="relative z-10 flex h-full flex-col p-3">
        <header className="mb-3 rounded-xl border border-iron bg-metal/80 p-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-wider text-gray-100">
                <span className="text-neon-pink text-glow-green">SHEDDIT</span>
              </h1>
              <p className="text-[10px] tracking-widest text-gray-400">
                "Di lo que quieres decir y ya!"
              </p>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-gray-500">estado</div>
              <div className="text-sm font-bold text-gray-200">
                {status === 'idle' ? 'STANDBY' : status === 'playing' ? 'ACTIVE' : 'TERMINADO'}
              </div>
            </div>
          </div>
        </header>

        <div className="mb-3">
          <RulesPanel />
        </div>

        <div className="mb-3 rounded-xl border border-iron bg-metal/60 p-3 shadow-lg backdrop-blur-md">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-widest text-gray-500">objetivo</span>
            <span className="text-[9px] uppercase tracking-widest text-gray-600">
              longitud: {secretWord.length || '?'}
            </span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tracking-[0.3em] text-gray-100">
              {status === 'won' ? (
                <span className="text-neon-pink text-glow-green">{secretWord}</span>
              ) : secretWord ? (
                '•'.repeat(secretWord.length)
              ) : (
                '•'.repeat(6)
              )}
            </div>
            {status === 'idle' && (
              <p className="mt-1 text-[9px] uppercase tracking-wider text-gray-600">
                esperando inicio del sistema...
              </p>
            )}
            {status === 'won' && (
              <p className="mt-1 text-[9px] uppercase tracking-wider text-neon-pink">
                objetivo desbloqueado
              </p>
            )}
          </div>
        </div>

        <div className="mb-3 flex-1 rounded-xl border border-iron bg-metal/60 p-3 shadow-lg backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              feed_chat.dat
            </h2>
            <span className="text-[9px] text-gray-600">{attempts.length} entradas</span>
          </div>
          <AttemptsList attempts={attempts} />
        </div>

        <div className="mb-3 flex-1 rounded-xl border border-iron bg-metal/60 p-3 shadow-lg backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              top_aproximaciones.log
            </h2>
            <span className="text-[9px] text-gray-600">{bestApproximations.length} registros</span>
          </div>
          <BestApproximations approximations={bestApproximations} />
        </div>

        <div className="rounded-xl border border-iron bg-metal/60 p-3 shadow-lg backdrop-blur-md">
          <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            system_status
          </h2>
          <GameStatus status={status} />
        </div>

        <div className="mt-3 text-center">
          <span className="text-[8px] uppercase tracking-widest text-gray-700">
            SHEDDIT // Industrial Overlay // Build 2026.08
          </span>
        </div>
      </div>
    </div>
  );
}
