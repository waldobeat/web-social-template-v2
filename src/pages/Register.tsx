import { useState } from 'react'

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!acceptedTerms) {
            setError('Debes aceptar los términos y condiciones para continuar')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            // Simulación de registro
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Validaciones básicas
            if (!email || !password || !username) {
                throw new Error('Todos los campos son requeridos')
            }

            if (password.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres')
            }

            if (!email.includes('@')) {
                throw new Error('Ingresa un email válido')
            }

            // Registro exitoso
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
                <div className="register-header">
                    <h1 className="register-title">SHEDDIT</h1>
                    <p className="register-subtitle">Únete a la revolución de las redes sociales</p>
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
                            placeholder="tu_nombre_usuario"
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
                            placeholder="tu@email.com"
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
                                He leído y acepto los <a href="/terms" target="_blank" rel="noopener noreferrer">Términos de Servicio</a> de Sheddit. Entiendo que mi privacidad es total y mi responsabilidad sobre lo que publico es absoluta.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>¿Ya tienes cuenta? <a href="#login">Iniciar sesión</a></p>
                </div>
            </div>
        </div>
    )
}

export default Register
