import { useState } from 'react';
import { hashPassword, MASTER_HASH, MASTER_USER } from '../utils/auth';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    try {
      const hash = await hashPassword(password);
      if (username === MASTER_USER && hash === MASTER_HASH) {
        onLoginSuccess();
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-concrete px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-neon-pink/30 bg-metal shadow-[0_0_40px_rgba(255,0,255,0.15)]">
        <div className="border-b border-iron bg-black/40 p-6 text-center">
          <h1 className="text-3xl font-bold tracking-widest text-gray-100">
            SHEDDIT <span className="text-neon-pink text-glow-pink">ADMIN</span>
          </h1>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-gray-400">
            Acceso Restringido
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-neon-pink/80">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-iron bg-concrete px-3 py-2 text-sm text-gray-200 transition focus:border-neon-pink focus:outline-none focus:ring-1 focus:ring-neon-pink/50"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-neon-pink/80">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-iron bg-concrete px-3 py-2 text-sm text-gray-200 transition focus:border-neon-pink focus:outline-none focus:ring-1 focus:ring-neon-pink/50"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded border border-neon-red/30 bg-neon-red/10 p-2 text-center text-[10px] uppercase tracking-wider text-neon-red">
              Credenciales invalidas
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg border border-neon-pink bg-neon-pink/10 py-2.5 text-xs font-bold uppercase tracking-widest text-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.2)] transition hover:bg-neon-pink/20 hover:shadow-[0_0_25px_rgba(255,0,255,0.4)] active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Verificando...' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
