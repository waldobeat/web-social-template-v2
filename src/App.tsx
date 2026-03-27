import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from './context/AuthContext'
import Register from './pages/Register'
import ThankYou from './pages/ThankYou'
import TermsOfService from './pages/TermsOfService'

function App() {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) return <div className="loading">Cargando...</div>

    return (
        <Router>
            <Helmet>
                <title>SHEDDIT | ¿Tienes algo que decir? Dilo</title>
                <meta name="description" content="Sheddit: La primera red social bajo el protocolo de libertad radical y minimización de datos. Únete a la red de Nodos y recupera tu privacidad." />
                <meta name="keywords" content="Sheddit, Red Social, Privacidad, Libertad de Expresión, Blockchain, Nodos" />
                <meta property="og:title" content="SHEDDIT | ¿Tienes algo que decir? Dilo" />
                <meta property="og:description" content="Únete a la red social donde tu identidad no es una mercancía." />
            </Helmet>
            <Routes>
                <Route
                    path="/"
                    element={
                        isAuthenticated ?
                            <Navigate to="/thankyou" replace /> :
                            <Register onRegister={() => {}} />
                    }
                />
                <Route
                    path="/thankyou"
                    element={
                        isAuthenticated ?
                            <ThankYou /> :
                            <Navigate to="/" replace />
                    }
                />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App
