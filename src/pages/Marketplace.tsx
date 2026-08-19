import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginScreen from '../components/LoginScreen';
import { getSessionRole, setSessionRole } from '../utils/auth';

const GAMES = [
  {
    id: 'sheddit',
    title: 'SHEDDIT',
    description: 'Juego de deducción semántica impulsado por IA. Tus espectadores adivinan conceptos usando proximidad de significado real.',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    tag: 'IA SEMÁNTICA'
  },
  {
    id: 'wordwars',
    title: 'WORD WARS',
    description: 'Batalla en tiempo real donde tu audiencia lanza palabras clave para destruir defensas generadas proceduralmente.',
    status: 'BETA',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop',
    tag: 'MULTIPLAYER'
  },
  {
    id: 'pixeldrop',
    title: 'PIXEL DROP',
    description: 'Revelación colectiva. Los espectadores aportan pixeles a través de comandos para revelar obras maestras ocultas.',
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
    <div className="min-h-screen bg-concrete text-gray-200 selection:bg-neon-pink/30">
      {/* Navbar Minimalista */}
      <nav className="sticky top-0 z-40 border-b border-iron bg-concrete/60 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-bold tracking-widest text-gray-100">
              SHEDDIT<span className="text-neon-pink">.</span>
            </h1>
            <span className="hidden rounded-full border border-iron bg-metal px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-gray-400 sm:block">
              Marketplace
            </span>
          </div>

          <div>
            {role ? (
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-gray-500">
                  [{role}]
                </span>
                {role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-xs font-semibold text-neon-pink hover:text-white transition-colors"
                  >
                    Control Panel
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="rounded-md border border-iron bg-transparent px-3 py-1.5 text-[11px] font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="rounded-md bg-white px-4 py-1.5 text-xs font-semibold text-black transition-all hover:bg-gray-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              >
                Ingresar
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative px-6 py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,0,255,0.03)_0%,_transparent_50%)]"></div>
        <div className="relative mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center justify-center rounded-full border border-neon-pink/20 bg-neon-pink/5 px-3 py-1 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-neon-pink mr-2 shadow-[0_0_8px_rgba(255,0,255,0.8)]"></span>
            <span className="text-[11px] font-medium tracking-wide text-neon-pink">V2.0 LIVE ENABLED</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-sm">
            Di lo que quieres <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-neon-pink to-purple-500 bg-clip-text text-transparent">decir y ya.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base md:text-lg text-gray-400 font-light leading-relaxed">
            Plataforma de experiencias interactivas para TikTok LIVE. Impulsa tu engagement con motores semánticos, físicas en tiempo real y dinámicas de chat masivas.
          </p>
        </div>
      </header>

      {/* Grid de Juegos */}
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-10 flex items-center justify-between border-b border-iron pb-4">
          <h3 className="text-sm font-medium text-gray-300">
            Sistemas Disponibles
          </h3>
          <span className="font-mono text-xs text-gray-500">
            {GAMES.length} MODULOS
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <div key={game.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-iron bg-metal transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              
              <div className="relative h-48 overflow-hidden border-b border-iron">
                <div className="absolute inset-0 bg-black/20 z-10"></div>
                <img src={game.image} alt={game.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute left-4 top-4 z-20">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wide backdrop-blur-md ${
                    game.status === 'ACTIVE' ? 'border-neon-pink/30 bg-neon-pink/10 text-neon-pink' :
                    game.status === 'BETA' ? 'border-neon-yellow/30 bg-neon-yellow/10 text-neon-yellow' :
                    'border-gray-500/30 bg-gray-500/10 text-gray-400'
                  }`}>
                    {game.status === 'ACTIVE' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-neon-pink shadow-[0_0_5px_rgba(255,0,255,0.6)]"></span>}
                    {game.status}
                  </span>
                </div>
              </div>

              <div className="relative flex flex-1 flex-col p-6">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">{game.title}</h4>
                  <span className="font-mono text-[10px] text-gray-500">{game.tag}</span>
                </div>
                <p className="mb-6 flex-1 text-sm text-gray-400 font-light leading-relaxed">
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
                  className={`w-full rounded-md py-2.5 text-xs font-semibold transition-all ${
                    game.status === 'ACTIVE' 
                      ? 'bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]' 
                      : 'bg-iron text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={game.status !== 'ACTIVE'}
                >
                  {game.status === 'ACTIVE' ? (
                    role === 'admin' && game.id === 'sheddit' ? 'Gestionar Instancia →' : 'Ver Demo'
                  ) : 'En Desarrollo'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-iron bg-metal px-6 py-12 text-center">
        <p className="font-mono text-[11px] text-gray-600">
          © 2026 WALDOBEATMAKER ENTERTAINMENT. DEPLOYED ON VERCEL.
        </p>
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
