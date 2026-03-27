import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import ThankYou from './pages/ThankYou'
import TermsOfService from './pages/TermsOfService'

function App() {
    const [isRegistered, setIsRegistered] = useState(false)

    return (
        <Router>
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
    )
}

export default App
