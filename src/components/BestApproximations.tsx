import type { BestApproximation } from '../types/game';
import { getRankColor, getRankBgGlow } from '../utils/semantic';

interface BestApproximationsProps {
  approximations: BestApproximation[];
}

export default function BestApproximations({ approximations }: BestApproximationsProps) {
  if (approximations.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-iron bg-concrete/50">
        <div className="text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider">
            sin datos de aproximacion
          </p>
          <p className="mt-0.5 text-[9px] text-gray-700">
            [ esperando mejores registros... ]
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-1 overflow-y-auto pr-1">
      {approximations.map((approx) => (
        <div
          key={approx.position}
          className={`flex items-center justify-between rounded-md border border-transparent px-2.5 py-1.5 transition-all duration-150 hover:scale-[1.01] ${getRankBgGlow(approx.rank)} ${approx.rank === 1 ? 'border-neon-pink border-glow-pink' : 'border-l-2 border-neon-pink/40'}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[9px] font-bold ${getRankColor(approx.rank)}`}>
              {approx.position}
            </span>
            <span className="truncate text-xs font-bold text-gray-200">{approx.word}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] uppercase tracking-wider text-gray-500">
              {approx.rank === 1 ? 'ENCONTRADA' : `RANGO ${approx.rank}`}
            </span>
            <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-bold ${getRankColor(approx.rank)}`}>
              {approx.rank === 1 ? 'OK' : 'N/A'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
