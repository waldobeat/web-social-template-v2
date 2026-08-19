import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface LoginScreenProps {
  onLoginSuccess: (role: 'admin' | 'user') => void;
  onClose?: () => void;
}

export default function LoginScreen({ onLoginSuccess, onClose }: LoginScreenProps) {
  const [error, setError] = useState<string | false>(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(false);
    setIsLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      
      // For now, anyone who logs in with Google is considered 'admin'
      // since the owner requested to integrate Firebase Auth
      // In a real production app, we would check user.email or a Firestore role
      onLoginSuccess('admin');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    onLoginSuccess('user');
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
            Identifícate para continuar
          </p>
        </div>
        
        <div className="p-8 pt-4 space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-md bg-white py-2.5 text-sm font-semibold text-black transition-all hover:bg-gray-200 active:scale-95 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {isLoading ? 'Conectando...' : 'Continuar con Google'}
          </button>

          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full rounded-md border border-white/10 bg-transparent py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/5 active:scale-95 disabled:opacity-50"
          >
            Entrar como Invitado
          </button>

          {error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 p-2.5 text-center text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
