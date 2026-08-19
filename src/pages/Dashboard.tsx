import { Navigate } from 'react-router-dom';
import GamePanel from '../components/GamePanel';
import ControlPanel from '../components/ControlPanel';
import { useGameSimulation } from '../hooks/useGameSimulation';
import { getSessionRole } from '../utils/auth';

export default function Dashboard() {
  const { gameState, isEngineReady, startGame, resetGame, botGuess } = useGameSimulation();
  const role = getSessionRole();

  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

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
          <p className="text-xs text-gray-500">
            Control local de simulación y overlay
          </p>
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
