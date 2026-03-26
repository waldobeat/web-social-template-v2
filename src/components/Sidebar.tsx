import { NavLink } from 'react-router-dom';
import { Home, Compass, Bell, User, MessageCircle } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';
import './Sidebar.css';

export const Sidebar = () => {
  const { setCreatePostOpen, notifications } = useAppContext();

  const unreadCount = Object.values(notifications).filter(n => !n.read).length;

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img src="/mascot.png" alt="Sheddit Mascot" className="mascot-animated" />
        <h1 className="logo-text">Sheddit</h1>
      </div>
      <nav className="nav-menu">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Home size={24} /> <span>Inicio</span>
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Compass size={24} /> <span>Explorar</span>
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <MessageCircle size={24} /> <span>Mensajes</span>
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div style={{ position: 'relative' }}>
            <Bell size={24} />
            {unreadCount > 0 && <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </div>
          <span>Notificaciones</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <User size={24} /> <span>Perfil</span>
        </NavLink>
        
        {/* Publicidad La Tasa */}
        <a 
          href="https://a-tasa-dolar-en-venezuela.uptodown.com/android" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="sidebar-ad"
        >
          <div className="ad-content">
            <img src="/ad-tasa.png" alt="La Tasa" className="ad-banner" />
            <div className="ad-overlay">
              <span className="ad-badge">AD</span>
              <span className="ad-title">La Tasa ☕</span>
            </div>
          </div>
        </a>
      </nav>
      <button className="btn-primary post-btn-sidebar" onClick={() => setCreatePostOpen(true)}>Publicar</button>
    </aside>
  );
};
