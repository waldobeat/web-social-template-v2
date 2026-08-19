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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-concrete shadow-2xl">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 transition-colors hover:text-white"
          >
            ✕
          </button>
        )}
        <div className="p-8 pb-4 text-center">
          <h2 className="mb-1 text-2xl font-bold tracking-tight text-white">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-gray-500">
            Ingresa a tu cuenta para continuar
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 pt-4 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-300">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 transition focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
              placeholder="Ej: waldobeatmaker"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-300">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 transition focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 p-2.5 text-center text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-white py-2.5 text-sm font-semibold text-black transition-all hover:bg-gray-200 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Verificando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
