import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import GamePanel from '../components/GamePanel';
import ControlPanel from '../components/ControlPanel';
import { useGameSimulation } from '../hooks/useGameSimulation';

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { gameState, isEngineReady, startGame, resetGame, botGuess } = useGameSimulation(userId);

  useEffect(() => {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      import('../lib/firebase').then(({ auth }) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setIsAdmin(!!user);
          setUserId(user?.uid);
        });
        return unsubscribe;
      });
    });
  }, []);

  if (isAdmin === null) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
        <p className="mt-4 font-mono text-xs tracking-widest text-gray-400">VERIFICANDO CREDENCIALES...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const overlayUrl = `${window.location.origin}/overlay/${userId}`;

  return (
    <div className="relative flex min-h-screen flex-col md:flex-row bg-[#0a0a0a]">
      {!isEngineReady && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
          <p className="mt-4 font-mono text-xs tracking-widest text-gray-400">INICIANDO MOTOR SEMANTICO...</p>
        </div>
      )}
      
      {/* Game Panel Preview */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)] p-4 md:p-8">
        <div className="origin-top transform scale-75 md:scale-100 shadow-2xl shadow-black/50 ring-1 ring-white/10 rounded-3xl overflow-hidden">
          <GamePanel gameState={gameState} />
        </div>
      </div>

      {/* Control Panel (Dashboard Sidebar) */}
      <div className="w-full border-t border-white/10 bg-[#0a0a0a] p-6 shadow-2xl md:w-[400px] md:border-l md:border-t-0 overflow-y-auto">
        <div className="mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-mono text-xl font-bold tracking-widest text-white">
              SHEDDIT<span className="text-neon-green">.</span>
            </h1>
            <span className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-[10px] font-medium tracking-wide text-gray-400">
              Admin Panel
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Control local de simulación y overlay
          </p>

          <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-4">
            <div className="text-xs font-semibold text-neon-green mb-1">URL de Transmisión (OBS)</div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={overlayUrl}
                className="w-full truncate rounded-md bg-black/50 px-2 py-1 text-[10px] font-mono text-gray-400 outline-none"
              />
              <button
                onClick={() => navigator.clipboard.writeText(overlayUrl)}
                className="rounded-md bg-neon-green/20 px-3 py-1 text-[10px] font-bold tracking-wider text-neon-green transition-colors hover:bg-neon-green/30"
              >
                COPIAR
              </button>
            </div>
          </div>
        </div>
        <ControlPanel
          gameState={gameState}
          onStartGame={startGame}
          onBotGuess={botGuess}
          onResetGame={resetGame}
        />
      </div>
    </div>
  );
}


