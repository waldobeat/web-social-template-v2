import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import TermsModal from '../components/TermsModal'

interface RegisterProps {
    onRegister: () => void
}

// Sub-component for the Blockchain Animation
const LandingIntro = ({ onComplete }: { onComplete: () => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [phase, setPhase] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    const phrases = [
        "Pronto una nueva red social...",
        "Donde nuestra expresión no será callada.",
        "Hablemos libremente sin tanto filtro.",
        "Sheddit: ¿Tienes algo que decir? Dilo."
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setPhase(prev => {
                if (prev >= phrases.length - 1) {
                    clearInterval(timer);
                    setTimeout(() => {
                        setFadeOut(true);
                        setTimeout(onComplete, 1200);
                    }, 1500);
                    return prev;
                }
                return prev + 1;
            });
        }, 2200); // Punchier timing

        // Canvas Particle System (Blockchain Nodes)
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
        const particleCount = 100; // Increased density

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.7,
                    vy: (Math.random() - 0.5) * 0.7,
                    size: Math.random() * 2 + 1
                });
            }
        };

        window.addEventListener('resize', resize);
        resize();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Connect nodes with gradient
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 180) {
                        ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 * (1 - dist / 180)})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', resize);
        };
    }, [onComplete]);


    return (
        <div className={`landing-intro-overlay ${fadeOut ? 'fade-out' : ''}`}>
            <canvas id="particle-canvas" ref={canvasRef} />
            <div className="intro-text-container">
                {phrases.map((text, index) => (
                    <p 
                        key={index} 
                        className={`intro-phrase ${index === phase ? 'active' : ''} ${index === 3 ? 'small' : ''}`}
                        style={{ display: index > phase ? 'none' : 'block' }}
                    >
                        {text}
                    </p>
                ))}
            </div>
        </div>
    );
};

function Register({ onRegister }: RegisterProps) {
    const { registerWithEmail, loginWithGoogle, userCount } = useAuth()
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
    const [showIntro, setShowIntro] = useState(true)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!acceptedTerms) {
            setError('Debes aceptar los términos y condiciones para continuar')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            if (!email || !password || !username) {
                throw new Error('Todos los campos son requeridos')
            }

            if (password.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres')
            }

            const cleanUsername = username.startsWith('u/') ? username.slice(2) : username;
            const finalUsername = `u/${cleanUsername}`;
            
            await registerWithEmail(email, password, finalUsername)
            onRegister()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrarse')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        setError('')
        try {
            await loginWithGoogle()
            onRegister()
        } catch (err) {
            setError('Error al iniciar con Google')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {showIntro && <LandingIntro onComplete={() => setShowIntro(false)} />}
            
            <div className={`register-container ${!showIntro ? 'visible' : ''}`}>
                <div className="register-card">
                    <div className="promo-badge">
                        ⚡ ¡OFERTA LANZAMIENTO: Beneficios EXCLUSIVOS para los primeros 1000 Nodos! ⚡
                    </div>

                    <div className="register-header">
                        <h1 className="register-title">SHEDDIT</h1>
                        <p className="register-subtitle">¿Tienes algo que decir? Dilo</p>
                    </div>

                    <div className="auth-methods">
                        <button className="google-button" onClick={handleGoogleLogin} disabled={isLoading}>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon" />
                            <span>Continuar con Google</span>
                        </button>
                        
                        <div className="divider">o regístrate con email</div>
                    </div>

                    <form onSubmit={handleSubmit} className="register-form">
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">Nombre de usuario</label>
                            <div className="username-prefix-wrapper">
                                <span className="username-prefix">u/</span>
                                <input
                                    type="text"
                                    id="username"
                                    className="username-input-prefixed"
                                    value={username.startsWith('u/') ? username.slice(2) : username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="nombre_unico"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@nodo.com"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="terms-group">
                            <label className="terms-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    disabled={isLoading}
                                />
                                <span>
                                    He leído y acepto los <button type="button" className="terms-link-btn" onClick={() => setIsTermsModalOpen(true)}>Términos de Servicio</button> de Sheddit. Entiendo mi responsabilidad absoluta.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="register-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creando Nodo...' : 'Unirme a la Red'}
                        </button>
                    </form>
                </div>

                <TermsModal 
                    isOpen={isTermsModalOpen} 
                    onClose={() => setIsTermsModalOpen(false)} 
                />
                <div className="subtle-user-count" title="Nodos activos">{userCount}</div>
            </div>
        </>
    )
}

export default Register
