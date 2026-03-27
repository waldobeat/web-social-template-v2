import { useState } from 'react'
import TermsModal from '../components/TermsModal'

interface RegisterProps {
    onRegister: () => void
}

function Register({ onRegister }: RegisterProps) {
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
            await new Promise(resolve => setTimeout(resolve, 1500))

            if (!email || !password || !username) {
                throw new Error('Todos los campos son requeridos')
            }

            if (password.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres')
            }

            onRegister()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrarse')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="promo-badge">
                    ⚡ ¡OFERTA LANZAMIENTO: Primeros 1000 Nodos obtienen PREMIUM DE POR VIDA! ⚡
                </div>

                <div className="register-header">
                    <h1 className="register-title">SHEDDIT</h1>
                    <p className="register-subtitle">Únete a la red social donde tu privacidad es ley.</p>
                </div>

                <div className="auth-methods">
                    <button className="google-button">
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
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="@nombre_unico"
                            disabled={isLoading}
                        />
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

                <div className="register-footer">
                    <p>¿Ya eres parte? <a href="#login">Iniciar sesión</a></p>
                </div>
            </div>

            <TermsModal 
                isOpen={isTermsModalOpen} 
                onClose={() => setIsTermsModalOpen(false)} 
            />
        </div>
    )
}

export default Register
