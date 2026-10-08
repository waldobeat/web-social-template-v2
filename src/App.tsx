import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Prestamos from './pages/Prestamos';
import Foro from './pages/Foro';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/perfil/:userId" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prestamos" element={<Prestamos />} />
          <Route path="/foro" element={<Foro />} />
          {/* Redirect old routes */}
          <Route path="/home" element={<Navigate to="/feed" replace />} />
          <Route path="/hall-of-fame" element={<Navigate to="/feed" replace />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
