import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { AppProvider } from './context/AppProvider';
import { useAuth, useUI } from './context';
import { CreatePostModal } from './components/CreatePostModal';
import { Login } from './pages/Login';
import { LoadingScreen } from './components/LoadingScreen';
import { CookieBanner } from './components/CookieBanner';
import { ToastProvider } from './hooks/useToast';

// Lazy load pages for code splitting - improves initial load time
const Feed = lazy(() => import('./pages/Feed').then(m => ({ default: m.Feed })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Explore = lazy(() => import('./pages/Explore').then(m => ({ default: m.Explore })));
const Messages = lazy(() => import('./pages/Messages').then(m => ({ default: m.Messages })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then(m => ({ default: m.CommunityPage })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));

import { useLocation } from 'react-router-dom';

function AppInner() {
  const { isAuthenticated, isLoading, profileLoaded } = useAuth();
  const { isCreatePostOpen, setCreatePostOpen } = useUI();
  const location = useLocation();

  // Check for missing Firebase config
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
      </div>
    );
  }

  if (isLoading || (isAuthenticated && !profileLoaded)) return <LoadingScreen />;
  if (!isAuthenticated) return <Login />;

  const isCommunityPage = location.pathname.startsWith('/community/');

  return (
    <>
      <div className="app-container">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Suspense fallback={<LoadingScreen />}><Feed /></Suspense>} />
          <Route path="/explore" element={<Suspense fallback={<LoadingScreen />}><Explore /></Suspense>} />
          <Route path="/messages" element={<Suspense fallback={<LoadingScreen />}><Messages /></Suspense>} />
          <Route path="/notifications" element={<Suspense fallback={<LoadingScreen />}><Notifications /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<LoadingScreen />}><Profile /></Suspense>} />
          <Route path="/profile/:userId" element={<Suspense fallback={<LoadingScreen />}><Profile /></Suspense>} />
          <Route path="/community/:communityId" element={<Suspense fallback={<LoadingScreen />}><CommunityPage /></Suspense>} />
        </Routes>
        {!isCommunityPage && <RightSidebar />}
      </div>
      <CookieBanner />
      {isCreatePostOpen && <CreatePostModal onClose={() => setCreatePostOpen(false)} />}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
