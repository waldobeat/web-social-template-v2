import { useState, useEffect } from 'react';
import type { GameState, BotConfig } from '../types/game';
import { getRandomSecretWord } from '../utils/semantic';

interface ControlPanelProps {
  onStartGame: (secretWord: string) => void;
  onBotGuess: (botName: string, word: string) => void;
  onResetGame: () => void;
  gameState: GameState | null;
}

const BOTS: BotConfig[] = [
  { name: 'Moderador_Ana', isMod: true, words: ['manzana', 'pera', 'fruta', 'rojo', 'verde', 'dulce', 'árbol', 'jugo', 'tarta', 'semilla', 'naranja', 'comida'] },
  { name: 'Moderador_Carlos', isMod: true, words: ['casa', 'hogar', 'puerta', 'ventana', 'techo', 'habitación', 'familia', 'calle', 'ciudad', 'edificio', 'apartamento', 'cocina'] },
  { name: 'Usuario_Maria', isMod: false, words: ['perro', 'gato', 'animal', 'peludo', 'ladrar', 'colita', 'parque', 'casa', 'comida', 'fiel', 'león', 'mascota'] },
  { name: 'Usuario_Juan', isMod: false, words: ['coche', 'carro', 'rueda', 'motor', 'camino', 'gasolina', 'conductor', 'asiento', 'volante', 'ciudad', 'tren', 'viaje'] },
  { name: 'Usuario_Laura', isMod: false, words: ['sol', 'luz', 'calor', 'cielo', 'día', 'estrella', 'verano', 'energía', 'brillo', 'mañana', 'luna', 'noche'] },
  { name: 'Usuario_Pedro', isMod: false, words: ['agua', 'río', 'mar', 'beber', 'vaso', 'lluvia', 'océano', 'pez', 'azul', 'fría', 'naranja', 'líquido'] },
];

export default function ControlPanel({ onStartGame, onBotGuess, onResetGame, gameState }: ControlPanelProps) {
  const [secretWord, setSecretWord] = useState(getRandomSecretWord());
  const [activeBots, setActiveBots] = useState<Set<string>>(new Set());
  const [autoMode, setAutoMode] = useState(false);
  const [speed, setSpeed] = useState(1500);

  useEffect(() => {
    if (!autoMode || !gameState || gameState.status !== 'playing') return;

    const interval = setInterval(() => {
      BOTS.forEach((bot) => {
        if (activeBots.has(bot.name)) {
          const word = bot.words[Math.floor(Math.random() * bot.words.length)];
          if (word !== gameState.secretWord) {
            onBotGuess(bot.name, word);
          }
        }
      });
    }, speed);

    return () => clearInterval(interval);
  }, [autoMode, activeBots, gameState, speed, onBotGuess]);

  const toggleBot = (name: string) => {
    setActiveBots((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleStart = () => {
    setSecretWord(getRandomSecretWord());
    onStartGame(secretWord);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        panel_de_control_local
      </h3>

      <div className="space-y-2">
        <label className="text-[9px] uppercase tracking-wider text-gray-500">
          palabra_secreta (simulacion)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={secretWord}
            onChange={(e) => setSecretWord(e.target.value)}
            className="flex-1 rounded-lg border border-iron bg-concrete px-2.5 py-1.5 text-xs text-gray-200 focus:border-neon-green focus:outline-none"
          />
          <button
            onClick={handleStart}
            disabled={gameState?.status === 'playing'}
            className="rounded-lg border border-neon-green bg-neon-green/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neon-green transition hover:bg-neon-green/20 disabled:opacity-30"
          >
            INICIAR
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-iron bg-concrete/60 p-2.5">
        <div>
          <div className="text-[10px] font-medium text-gray-300">modo_automatico</div>
          <div className="text-[9px] text-gray-600">bots activos enviaran palabras</div>
        </div>
        <button
          onClick={() => setAutoMode(!autoMode)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${autoMode ? 'bg-neon-green/30 border border-neon-green' : 'bg-iron border border-iron'}`}
        >
          <span className={`inline-block h-3 w-3 transform rounded-full bg-gray-400 transition ${autoMode ? 'translate-x-5 bg-neon-green' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] uppercase tracking-wider text-gray-500">
          velocidad (ms): {speed}
        </label>
        <input
          type="range"
          min="500"
          max="3000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full accent-neon-green h-1 bg-iron rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="space-y-1.5">
        <div className="text-[9px] uppercase tracking-wider text-gray-500">bots_simulados</div>
        {BOTS.map((bot) => (
          <div key={bot.name} className="flex items-center justify-between rounded-lg border border-iron bg-concrete/60 px-2.5 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-gray-300">{bot.name}</span>
              {bot.isMod && (
                <span className="rounded-sm border border-neon-green/40 bg-neon-green/10 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-neon-green">
                  MOD
                </span>
              )}
            </div>
            <button
              onClick={() => toggleBot(bot.name)}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition ${activeBots.has(bot.name) ? 'bg-neon-green/30 border border-neon-green' : 'bg-iron border border-iron'}`}
            >
              <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-gray-500 transition ${activeBots.has(bot.name) ? 'translate-x-4 bg-neon-green' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>

      {gameState?.status === 'playing' && (
        <div className="rounded-lg border border-neon-yellow/20 bg-neon-yellow/5 p-2.5 text-[10px] text-neon-yellow">
          <div className="font-bold">&gt; consejo_rapido:</div>
          <div className="mt-0.5 text-gray-400">
            activa bots y modo automatico para simular el chat.
          </div>
        </div>
      )}

      <button
        onClick={onResetGame}
        className="w-full rounded-lg border border-iron bg-concrete/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 transition hover:bg-iron hover:text-gray-200"
      >
        reiniciar_sistema
      </button>
    </div>
  );
}