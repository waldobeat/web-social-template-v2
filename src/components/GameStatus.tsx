import type { GameStatus as GameStatusType } from '../types/game';

interface GameStatusProps {
  status: GameStatusType;
}

const STATUS_CONFIG: Record<GameStatusType, { label: string; color: string; icon: string; desc: string }> = {
  idle: { label: 'STANDBY', color: 'text-gray-500', icon: '⏸', desc: 'sistema en espera de inicio' },
  playing: { label: 'ACTIVE', color: 'text-neon-green', icon: '▶', desc: 'procesando entradas del chat' },
  won: { label: 'TERMINADO', color: 'text-neon-green', icon: '✓', desc: 'objetivo alcanzado' },
};

export default function GameStatus({ status }: GameStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg text-neon-green">{config.icon}</span>
        <div>
          <div className={`text-sm font-bold uppercase tracking-wider ${config.color}`}>
            {config.label}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-gray-600">
            estado del sistema
          </div>
        </div>
      </div>
      <div className="rounded-md border border-iron bg-concrete/60 p-2 text-[10px] text-gray-400">
        <span className="text-neon-green">&gt;</span> {config.desc}
      </div>
      {status === 'playing' && (
        <div className="rounded-md border border-neon-green/20 bg-neon-green/5 p-2 text-[9px] text-neon-green">
          <span className="font-bold">&gt; consejo:</span> usar sustantivos comunes. sin limite de intentos.
        </div>
      )}
    </div>
  );
}
