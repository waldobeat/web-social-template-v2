import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import TermsModal from '../components/TermsModal'

interface RegisterProps {
    onRegister: () => void
}

function Register({ onRegister }: RegisterProps) {
    const { registerWithEmail, loginWithGoogle } = useAuth()
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

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

            // Real registration with real prefix u/
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
        <div className="register-container">
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
        </div>
    )
}

export default Register
