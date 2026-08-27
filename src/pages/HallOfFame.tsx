import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Pet {
  username: string;
  pet_name: string;
  color: string;
  pattern: string;
  stage: string;
  evolution_points: number;
  hunger: number;
}

export default function HallOfFame() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine the API URL based on environment
    const apiUrl = import.meta.env.DEV 
      ? 'http://localhost:3000/api/pets' 
      : '/api/pets';

    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        setPets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch pets', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    import('firebase/auth').then(({ signOut }) => {
      import('../lib/firebase').then(({ auth }) => {
        signOut(auth);
      });
    });
    sessionStorage.removeItem('sheddit_role');
    navigate('/');
  };

  const getPetEmoji = (stage: string) => {
    const s = (stage || '').toLowerCase();
    if (s.includes('pollito')) return '🐣';
    if (s.includes('pollo')) return '🐥';
    if (s.includes('gallo')) return '🐓';
    if (s.includes('zamuro') || s.includes('gavilán') || s.includes('halcón') || s.includes('águila') || s.includes('cóndor')) return '🦅';
    if (s.includes('dragón')) return '🐉';
    return '🥚';
  };

  const getHungerColor = (hunger: number) => {
    if (hunger > 60) return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]';
    if (hunger > 30) return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]';
    return 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-neon-pink/30 flex flex-col font-mono relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/30 rounded-full blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/30 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-widest text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              SHEDDIT<span className="text-neon-pink">.</span>
            </h1>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-gray-400">
              Salón de la Fama
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-white/10 bg-transparent px-3 py-1.5 text-[11px] font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 flex-1">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 drop-shadow-[0_0_15px_rgba(52,211,235,0.3)] mb-4">
            Mascotas de la Comunidad
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Explora el estado en tiempo real de todas las mascotas virtuales del servidor.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500"></div>
            <span className="ml-4 text-emerald-500 font-bold tracking-widest text-sm">CARGANDO DATOS...</span>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-20 text-gray-500 border border-white/5 rounded-2xl bg-black/40 backdrop-blur-md">
            No se encontraron mascotas en la base de datos.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pets.map((pet, idx) => (
              <div 
                key={pet.username} 
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/40 hover:bg-white/10 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)] backdrop-blur-md"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Stage Badge */}
                <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg backdrop-blur-md z-10">
                  Nvl. {pet.stage}
                </div>

                <div className="flex flex-col items-center justify-center mb-6 mt-4 relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="text-[80px] leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-500">
                    {getPetEmoji(pet.stage)}
                  </span>
                </div>

                <div className="flex-1 text-center border-t border-white/10 pt-4 relative z-10">
                  <h3 className="text-lg font-black text-white mb-1 uppercase tracking-wide group-hover:text-emerald-400 transition-colors">
                    {pet.pet_name || `Mascota de ${pet.username}`}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium tracking-widest mb-4">
                    @{pet.username}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-300 bg-black/30 rounded-lg p-2 border border-white/5">
                      <span className="uppercase tracking-wider">Evolución</span>
                      <span className="text-cyan-400 font-black">{pet.evolution_points} pts</span>
                    </div>

                    <div className="flex flex-col gap-1.5 bg-black/30 rounded-lg p-2 border border-white/5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-300">
                        <span className="uppercase tracking-wider">Hambre</span>
                        <span>{pet.hunger}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${getHungerColor(pet.hunger)}`}
                          style={{ width: `${pet.hunger}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
