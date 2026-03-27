import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import Register from './pages/Register'
import ThankYou from './pages/ThankYou'
import TermsOfService from './pages/TermsOfService'

function App() {
    const [isRegistered, setIsRegistered] = useState(false)

    return (
        <AuthProvider>
            <Router>
                <Helmet>
                    <title>Sheddit | ¿Tienes algo que decir? Dilo</title>
                    <meta name="description" content="Sheddit: La primera red social bajo el protocolo de libertad radical y minimización de datos. Únete a la red de Nodos y recupera tu privacidad." />
                    <meta name="keywords" content="Sheddit, Red Social, Privacidad, Libertad de Expresión, Blockchain, Nodos" />
                    <meta property="og:title" content="Sheddit | ¿Tienes algo que decir? Dilo" />
                    <meta property="og:description" content="Únete a la red social donde tu identidad no es una mercancía." />
                </Helmet>
                <Routes>
                    <Route
                        path="/"
                        element={
                            isRegistered ?
                                <Navigate to="/thankyou" replace /> :
                                <Register onRegister={() => setIsRegistered(true)} />
                        }
                    />
                    <Route
                        path="/thankyou"
                        element={
                            isRegistered ?
                                <ThankYou /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
