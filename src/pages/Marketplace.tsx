import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginScreen from '../components/LoginScreen';
import { getSessionRole, setSessionRole } from '../utils/auth';

const GAMES = [
  {
    id: 'sheddit',
    title: 'SHEDDIT',
    description: 'Juego de deducción semántica. Adivina palabras en el chat usando proximidad de inteligencia artificial.',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    tag: 'IA SEMÁNTICA'
  },
  {
    id: 'wordwars',
    title: 'WORD WARS',
    description: 'Batalla por equipos donde los usuarios lanzan palabras clave para destruir la base enemiga.',
    status: 'BETA',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop',
    tag: 'MULTIPLAYER'
  },
  {
    id: 'pixeldrop',
    title: 'PIXEL DROP',
    description: 'Los espectadores sueltan pixeles con regalos para revelar imágenes ocultas en tiempo real.',
    status: 'COMING SOON',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
    tag: 'INTERACTIVO'
  }
];

export default function Marketplace() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);

  useEffect(() => {
    setRole(getSessionRole());
  }, []);

  const handleLoginSuccess = (newRole: 'admin' | 'user') => {
    setRole(newRole);
    setShowLogin(false);
    if (newRole === 'admin') {
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    setSessionRole(null);
    setRole(null);
  };

  return (
    <div className="min-h-screen bg-concrete text-gray-200">
      {/* Navbar */}
      <nav className="border-b border-iron bg-metal/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-widest text-gray-100">
              MARKET<span className="text-neon-pink text-glow-pink">PLACE</span>
            </h1>
            <span className="rounded-sm border border-neon-pink/40 bg-neon-pink/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon-pink hidden sm:block">
              TIKTOK LIVE
            </span>
          </div>

          <div>
            {role ? (
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-widest text-gray-400">
                  [{role}]
                </span>
                {role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-xs font-bold text-neon-pink hover:text-neon-pink-dim transition"
                  >
                    PANEL DE CONTROL
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-iron bg-concrete/60 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 transition hover:bg-iron hover:text-gray-200"
                >
                  SALIR
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="rounded-lg border border-neon-pink bg-neon-pink/10 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-neon-pink transition hover:bg-neon-pink/20"
              >
                INGRESAR AL SISTEMA
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="py-20 px-6 text-center border-b border-iron/50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-pink/10 via-concrete to-concrete">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold tracking-wider text-gray-100">
            JUEGOS <span className="text-neon-pink text-glow-pink">INTERACTIVOS</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400 tracking-widest leading-relaxed">
            Potencia tu stream en TikTok LIVE. Herramientas diseñadas para aumentar la interacción, 
            monetización y retención de espectadores de forma automática.
          </p>
        </div>
      </header>

      {/* Grid de Juegos */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold uppercase tracking-widest text-gray-300">
            CATÁLOGO_DISPONIBLE
          </h3>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">
            {GAMES.length} sistemas en linea
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {GAMES.map((game) => (
            <div key={game.id} className="group rounded-2xl border border-iron bg-metal overflow-hidden transition hover:border-neon-pink/50 hover:shadow-[0_0_30px_rgba(255,0,255,0.1)]">
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <img src={game.image} alt={game.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute top-4 left-4 z-20">
                  <span className={`rounded border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${
                    game.status === 'ACTIVE' ? 'border-neon-pink bg-neon-pink/20 text-neon-pink shadow-[0_0_10px_rgba(255,0,255,0.3)]' :
                    game.status === 'BETA' ? 'border-neon-yellow bg-neon-yellow/20 text-neon-yellow' :
                    'border-gray-500 bg-gray-500/20 text-gray-400'
                  }`}>
                    {game.status}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold tracking-wider text-gray-100">{game.title}</h4>
                  <span className="text-[9px] text-neon-pink uppercase tracking-widest">{game.tag}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed min-h-[60px]">
                  {game.description}
                </p>
                
                <button
                  onClick={() => {
                    if (!role) {
                      setShowLogin(true);
                    } else if (role === 'admin' && game.id === 'sheddit') {
                      navigate('/admin');
                    }
                  }}
                  className={`w-full rounded-lg py-2.5 text-[10px] font-bold uppercase tracking-widest transition ${
                    game.status === 'ACTIVE' 
                      ? 'border border-neon-pink bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20' 
                      : 'border border-iron bg-concrete/60 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={game.status !== 'ACTIVE'}
                >
                  {game.status === 'ACTIVE' ? (
                    role === 'admin' && game.id === 'sheddit' ? 'IR AL PANEL' : 'VER DEMO'
                  ) : 'BLOQUEADO'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-iron py-8 text-center text-[10px] uppercase tracking-widest text-gray-600">
        © 2026 WALDOBEATMAKER ENTERTAINMENT
      </footer>

      {showLogin && (
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess} 
          onClose={() => setShowLogin(false)} 
        />
      )}
    </div>
  );
}
