import type { Attempt } from '../types/game';
import { getRankColor, getRankLabel, getRankRing, getRankBgGlow } from '../utils/semantic';

interface AttemptsListProps {
  attempts: Attempt[];
}

export default function AttemptsList({ attempts }: AttemptsListProps) {
  if (attempts.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-iron bg-concrete/50">
        <div className="text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider">
            esperando datos del chat...
          </p>
          <p className="mt-0.5 text-[9px] text-gray-700">
            [ sin entradas registradas ]
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-1 overflow-y-auto pr-1">
      {attempts.slice().reverse().map((attempt) => (
        <div
          key={attempt.id}
          className={`flex items-center justify-between rounded-md border border-transparent px-2.5 py-1.5 transition-all duration-150 hover:scale-[1.01] ${getRankRing(attempt.rank)} ${getRankBgGlow(attempt.rank)} ${attempt.rank === 1 ? 'border-neon-pink border-glow-green' : ''}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate text-xs font-bold text-gray-200">
              {attempt.word}
            </span>
            {attempt.isMod && (
              <span className="shrink-0 rounded-sm border border-neon-pink/40 bg-neon-pink/10 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-neon-pink">
                MOD
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] uppercase tracking-wider text-gray-500">
              {getRankLabel(attempt.rank)}
            </span>
            <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-bold ${getRankColor(attempt.rank)}`}>
              #{attempt.rank}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
