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
    onStartGame(secretWord);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Control de Simulación
      </h3>

      <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
        <label className="text-xs font-medium text-gray-300">
          Palabra Secreta (Objetivo)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={secretWord}
            onChange={(e) => setSecretWord(e.target.value)}
            className="flex-1 rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-gray-600 transition focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
          <button
            onClick={handleStart}
            disabled={gameState?.status === 'playing'}
            className="rounded-md bg-white px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-white"
          >
            Iniciar
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
        <div>
          <div className="text-sm font-medium text-gray-200">Modo Automático</div>
          <div className="text-xs text-gray-500">Bots enviarán palabras al azar</div>
        </div>
        <button
          onClick={() => setAutoMode(!autoMode)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoMode ? 'bg-white' : 'bg-white/10'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${autoMode ? 'translate-x-4' : 'translate-x-0.5 bg-gray-400'}`} />
        </button>
      </div>

      <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
        <label className="flex items-center justify-between text-xs font-medium text-gray-300">
          <span>Velocidad de Bots</span>
          <span className="font-mono text-[10px] text-gray-500">{speed}ms</span>
        </label>
        <input
          type="range"
          min="500"
          max="3000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-300">Usuarios Simulados</div>
        {BOTS.map((bot) => (
          <div key={bot.name} className="flex items-center justify-between rounded-lg border border-white/5 bg-transparent px-3 py-2.5 transition-colors hover:bg-white/5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300">{bot.name}</span>
              {bot.isMod && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-gray-300">
                  MOD
                </span>
              )}
            </div>
            <button
              onClick={() => toggleBot(bot.name)}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${activeBots.has(bot.name) ? 'bg-white' : 'bg-white/10'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${activeBots.has(bot.name) ? 'translate-x-4' : 'translate-x-0.5 bg-gray-400'}`} />
            </button>
          </div>
        ))}
      </div>

      {gameState?.status === 'playing' && (
        <div className="rounded-xl border border-neon-yellow/20 bg-neon-yellow/5 p-4">
          <div className="text-xs font-semibold text-neon-yellow">Nota del Sistema</div>
          <div className="mt-1 text-xs text-gray-400">
            Activa bots y el modo automático para simular tráfico de chat en la interfaz del juego.
          </div>
        </div>
      )}

      <button
        onClick={onResetGame}
        className="w-full rounded-md border border-white/10 bg-transparent px-4 py-2.5 text-xs font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
      >
        Reiniciar Sistema
      </button>
    </div>
  );
}