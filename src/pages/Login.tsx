import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { user, createGuestUser } = useAuthContext();
  const [error, setError] = useState<string | false>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Email/Password states
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Simple Math Captcha states
  const [captchaQ, setCaptchaQ] = useState({ a: 0, b: 0 });
  const [captchaA, setCaptchaA] = useState('');

  useEffect(() => {
    if (user) navigate('/feed');
  }, [user, navigate]);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQ({ a, b });
    setCaptchaA('');
  };

  const handleGoogleLogin = async () => {
    setError(false);
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      sessionStorage.setItem('sheddit_role', 'admin');
      navigate('/feed');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    if (isRegistering) {
      // Check captcha
      if (parseInt(captchaA) !== captchaQ.a + captchaQ.b) {
        setError('Captcha incorrecto. Intenta de nuevo.');
        setIsLoading(false);
        generateCaptcha();
        return;
      }
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      sessionStorage.setItem('sheddit_role', 'admin');
      navigate('/feed');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de autenticación');
      if (isRegistering) generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    sessionStorage.setItem('sheddit_role', 'user');
    createGuestUser();
    navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-neon-pink/30 flex flex-col font-mono relative overflow-hidden items-center justify-center py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-widest text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] mb-2">
            SHEDDIT<span className="text-neon-pink">.</span>
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">
            Hablemos de préstamos y finanzas.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="space-y-6">
            
            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Correo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-neon-pink/40 transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-neon-pink/40 transition-all"
                  required
                  minLength={6}
                />
              </div>
              
              {isRegistering && (
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    Resuelve el captcha para continuar
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                      {captchaQ.a} + {captchaQ.b} =
                    </span>
                    <input
                      type="number"
                      value={captchaA}
                      onChange={(e) => setCaptchaA(e.target.value)}
                      className="w-20 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-center text-sm font-bold text-white outline-none focus:border-neon-pink/40 transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-neon-pink py-3 text-sm font-bold text-white shadow-lg shadow-neon-pink/20 transition-all hover:bg-neon-pink/80 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
              </button>
            </form>

            <div className="text-center text-xs text-gray-400">
              {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
              <button
                onClick={() => { setIsRegistering(!isRegistering); setError(false); }}
                className="ml-2 text-neon-pink font-bold hover:underline"
              >
                {isRegistering ? 'Inicia sesión' : 'Regístrate'}
              </button>
            </div>

            <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
              <span className="text-xs text-gray-500 uppercase font-bold">O</span>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-white py-3 text-sm font-bold text-black transition-all hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            <button
              onClick={handleGuestLogin}
              disabled={isLoading}
              type="button"
              className="w-full rounded-lg border border-white/20 bg-black/40 py-3 text-sm font-bold text-gray-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-50"
            >
              Entrar como Invitado (Solo lectura)
            </button>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/20 p-3 text-center text-xs font-medium text-red-300">
                {error}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-gray-600">
          La comunidad venezolana de préstamos y finanzas personales
        </p>
      </div>
    </div>
  );
}
