import { useState } from 'react';
import { hashPassword, MASTER_HASH, MASTER_USER, setSessionRole } from '../utils/auth';

interface LoginScreenProps {
  onLoginSuccess: (role: 'admin' | 'user') => void;
  onClose?: () => void;
}

export default function LoginScreen({ onLoginSuccess, onClose }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | false>(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    try {
      const cleanUser = username.trim();
      const cleanPass = password.trim();

      if (cleanUser === MASTER_USER) {
        if (!window.crypto || !window.crypto.subtle) {
          throw new Error('Criptografía no soportada en este navegador o entorno no seguro (HTTP sin localhost).');
        }
        const hash = await hashPassword(cleanPass);
        if (hash === MASTER_HASH) {
          setSessionRole('admin');
          onLoginSuccess('admin');
        } else {
          setError('Contraseña incorrecta para Admin');
        }
      } else {
        // Generic user login simulation
        setSessionRole('user');
        onLoginSuccess('user');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al validar credenciales');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-concrete/80 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-neon-pink/30 bg-metal shadow-[0_0_40px_rgba(255,0,255,0.15)]">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-neon-pink transition-colors"
          >
            ✕
          </button>
        )}
        <div className="border-b border-iron bg-black/40 p-6 text-center">
          <h1 className="text-3xl font-bold tracking-widest text-gray-100">
            MARKET<span className="text-neon-pink text-glow-pink">PLACE</span>
          </h1>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-gray-400">
            Ingreso al Sistema
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
              placeholder="Cualquier usuario o admin"
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
              {error === true ? 'Credenciales invalidas' : error}
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
