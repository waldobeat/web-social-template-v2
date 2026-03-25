import { useState, useEffect } from 'react';
import { useAppContext } from '../context/useAppContext';
import './Login.css';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  // Demographic and anti-bot fields
  const [birthDate, setBirthDate] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [captchaQ, setCaptchaQ] = useState({ a: 0, b: 0, op: '+' });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const { login, register, loginWithGoogle } = useAppContext();

  const availableInterests = ['Moda', 'Maquillaje', 'Fitness', 'Cine', 'Música', 'Arte', 'Tecnología', 'Viajes'];

  // Generar captcha al entrar al registro
  useEffect(() => {
    if (isRegister) {
      generateCaptcha();
    }
  }, [isRegister]);

  const generateCaptcha = () => {
    const isSum = Math.random() > 0.5;
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQ({ a, b, op: isSum ? '+' : 'x' });
    setCaptchaAnswer('');
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (isRegister && (!username || username === 'u/')) {
      const parts = val.split('@');
      if (parts[0]) setUsername(`u/${parts[0]}`);
    }
  };

  const handleUsernameChange = (val: string) => {
    let clean = val;
    if (val.startsWith('u/')) {
      clean = val.substring(2);
    } else if (val.startsWith('u')) {
      clean = val.substring(1);
    }
    // Remove any special chars except underscore
    clean = clean.replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(`u/${clean}`);
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      alert(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        // Validación de correo
        const allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
        const domain = email.split('@')[1]?.toLowerCase() || '';
        if (!allowedDomains.includes(domain)) {
          throw new Error(`Por seguridad, solo admitimos correos como Gmail, Hotmail, Outlook o Yahoo.`);
        }

        // Validación de edad mínima (18)
        const today = new Date();
        const bDate = new Date(birthDate);
        let calculatedAge = today.getFullYear() - bDate.getFullYear();
        const m = today.getMonth() - bDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) calculatedAge--;

        if (calculatedAge < 18) {
          throw new Error("Debes ser mayor de 18 años para unirte a la plataforma.");
        }

        // Validación Captcha matemático
        const expected = captchaQ.op === '+' ? captchaQ.a + captchaQ.b : captchaQ.a * captchaQ.b;
        if (parseInt(captchaAnswer) !== expected) {
          generateCaptcha();
          throw new Error("El resultado del Captcha es incorrecto. Por favor, intenta de nuevo.");
        }

        if (interests.length === 0) throw new Error("Amiga, por favor elige al menos un interés para recomendarte contenido.");
        await register(email, password, username, { age: birthDate, interests });
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/mascot.png" alt="Sheddit Mascot" className="mascot-animated login-mascot" />
          <h1 className="login-logo">Sheddit</h1>
          <p className="login-subtitle">Donde las chicas reinan ✨</p>
        </div>
        {/* Google Sign In Button */}
        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={loadingGoogle}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loadingGoogle ? 'Conectando...' : isRegister ? 'Registrarse con Google' : 'Iniciar sesión con Google'}
        </button>

        <div className="divider">
          <span>o</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-row">
            <div className="input-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                placeholder="ana@ejemplo.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
              />
            </div>

            {isRegister && (
              <div className="input-group">
                <label>Nombre de usuario</label>
                <input
                  type="text"
                  placeholder="u/usuario"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {isRegister && (
            <>
              <div className="form-row">
                <div className="input-group">
                  <label>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Tus intereses (Elige al menos 1)</label>
                <div className="interests-grid modern">
                  {availableInterests.map(i => (
                    <button
                      type="button"
                      key={i}
                      className={`interest-chip ${interests.includes(i) ? 'selected' : ''}`}
                      onClick={() => {
                        if (interests.includes(i)) setInterests(interests.filter(x => x !== i));
                        else setInterests([...interests, i]);
                      }}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div className="security-section">
                <div className="security-header">
                  <span className="security-shield">🛡️</span>
                  <div className="security-info">
                    <span className="security-title">Validación Humana</span>
                    <span className="security-desc">Resuelve para continuar</span>
                  </div>
                </div>
                <div className="captcha-modern">
                  <div className="captcha-question-box">
                    <span>¿Cuánto es {captchaQ.a} {captchaQ.op} {captchaQ.b}?</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Tu respuesta"
                    className="captcha-input"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {!isRegister && (
            <div className="input-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="login-btn premium">
            {isRegister ? 'Crear mi cuenta ✨' : 'Entrar al feed 🐱'}
          </button>
        </form>

        <button className="toggle-auth" type="button" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>

        <div className="login-footer">
          Al entrar, aceptas nuestras normas de convivencia y protección entre amigas. 💖
        </div>
      </div>
    </div>
  );
};
