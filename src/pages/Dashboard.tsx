
import GamePanel from '../components/GamePanel';
import ControlPanel from '../components/ControlPanel';
import { useGameSimulation } from '../hooks/useGameSimulation';

export default function Dashboard() {
  const { gameState, isEngineReady, startGame, resetGame, botGuess } = useGameSimulation();

  return (
    <div className="relative min-h-screen bg-concrete">
      {!isEngineReady && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-neon-green/20 border-t-neon-green"></div>
          <p className="mt-4 text-[10px] uppercase tracking-widest text-neon-green text-glow-green">Iniciando Motor Semantico...</p>
        </div>
      )}
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Game Panel Preview */}
        <div className="flex-1 overflow-auto bg-black p-4 flex justify-center items-start">
          <div className="transform scale-75 md:scale-90 origin-top">
            <GamePanel gameState={gameState} />
          </div>
        </div>

        {/* Control Panel (Dashboard) */}
        <div className="w-full md:w-96 border-l border-iron bg-metal p-5 shadow-2xl overflow-y-auto">
          <div className="mb-6 border-b border-iron pb-4">
            <h1 className="text-xl font-bold tracking-wider text-gray-100">
              SHEDDIT <span className="text-neon-green text-glow-green">ADMIN</span>
            </h1>
            <p className="text-[10px] tracking-widest text-gray-400">
              Panel de Control Local
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
    </div>
  );
}
