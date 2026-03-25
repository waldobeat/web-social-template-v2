import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { Feed } from './pages/Feed';
import { Profile } from './pages/Profile';
import { Explore } from './pages/Explore';
import { Messages } from './pages/Messages';
import { CommunityPage } from './pages/CommunityPage';
import { AppProvider } from './context/AppContext';
import { Notifications } from './pages/Notifications';
import { ToastProvider } from './hooks/useToast';

import { useAppContext } from './context/AppContext';
import { CreatePostModal } from './components/CreatePostModal';
import { Login } from './pages/Login';
import { LoadingScreen } from './components/LoadingScreen';
import { CookieBanner } from './components/CookieBanner';

function AppInner() {
  const { isCreatePostOpen, setCreatePostOpen, isAuthenticated, isLoading, profileLoaded } = useAppContext();

  // Check for missing Firebase config (Layer 0 security check)
  const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;
  if (!isFirebaseConfigured) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        padding: '20px',
        textAlign: 'center',
        background: '#1a1a1a',
        color: '#fff',
        fontFamily: 'system-ui'
      }}>
        <h1 style={{ color: '#ff4081' }}>⚠️ Configuración Incompleta</h1>
        <p>No se encontraron las variables de entorno de Firebase.</p>
        <p style={{ opacity: 0.7, maxWidth: '500px' }}>
          Por favor, asegúrate de haber configurado las variables (API Key, Project ID, etc.) en el panel de Vercel. 
          Consulta <code>.env.example</code> para ver la lista de variables requeridas.
        </p>
      </div>
    );
  }

  if (isLoading || (isAuthenticated && !profileLoaded)) return <LoadingScreen />;
  if (!isAuthenticated) return <Login />;

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} /> {/* Changed to Notifications component */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/community/:communityId" element={<CommunityPage />} />
        </Routes>
        <RightSidebar />
      </div>
      <CookieBanner />
      {isCreatePostOpen && <CreatePostModal onClose={() => setCreatePostOpen(false)} />}
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
