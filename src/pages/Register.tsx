import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../lib/AuthContext';
import { RECAPTCHA_SITE_KEY } from '../lib/firebase';

export default function Register() {
  const navigate = useNavigate();
  const { registerWithEmailPassword, createGuestUser } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | false>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const recaptchaWidgetId = useRef<number | null>(null);

  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setRecaptchaLoaded(true);
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const executeRecaptcha = async () => {
    if (typeof window !== 'undefined' && (window as any).grecaptcha) {
      try {
        const token = await (window as any).grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'register' });
        setRecaptchaToken(token);
      } catch (err) {
        console.error('reCAPTCHA error:', err);
      }
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (pwd: string) => {
    return pwd.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    if (!email.trim() || !password || !confirmPassword || !displayName.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (!validateEmail(email)) {
      setError('Correo electrónico inválido');
      return;
    }

    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    await executeRecaptcha();

    if (!recaptchaToken) {
      setError('Error en la verificación reCAPTCHA. Intenta de nuevo.');
      return;
    }

    setIsLoading(true);
    try {
      await registerWithEmailPassword(email.trim(), password, displayName.trim(), recaptchaToken);
      sessionStorage.setItem('sheddit_role', 'admin');
      navigate('/feed');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado');
      } else if (err.code === 'auth/invalid-email') {
        setError('Correo electrónico inválido');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es muy débil (mínimo 8 caracteres)');
      } else {
        setError(err.message || 'Error al crear la cuenta');
      }
    } finally {
      setIsLoading(false);
      setRecaptchaToken(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-neon-pink/30 flex flex-col font-mono relative overflow-hidden items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-widest text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] mb-2">
            SHEDDIT<span className="text-neon-pink">.</span>
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">
            Crea tu cuenta para participar en la comunidad
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Nombre para mostrar
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-neon-pink/40 transition-all placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-neon-pink/40 transition-all placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-neon-pink/40 transition-all placeholder-gray-600 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-sm"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Confirmar contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-neon-pink/40 transition-all placeholder-gray-600"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/20 p-3 text-center text-xs font-medium text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-neon-pink py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(255,0,110,0.5)] active:scale-95 disabled:opacity-50"
            >
              <svg className={`h-5 w-5 animate-spin ${isLoading ? 'inline' : 'hidden'}`} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => navigate('/')}
                className="text-neon-pink hover:underline font-medium"
              >
                Inicia sesión
              </button>
            </p>
            <p className="mt-3 text-sm text-gray-500">
              <button
                onClick={() => navigate('/')}
                className="text-neon-pink hover:underline font-medium"
              >
                Entrar con Google
              </button>{' '}
              o{' '}
              <button
                onClick={() => {
                  createGuestUser();
                  navigate('/feed');
                }}
                className="text-neon-pink hover:underline font-medium"
              >
                Entrar como Invitado
              </button>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-gray-600">
          La comunidad venezolana de préstamos y finanzas personales
        </p>
      </div>
    </div>
  );
}