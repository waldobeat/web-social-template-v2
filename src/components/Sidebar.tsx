import { NavLink } from 'react-router-dom';
import { Home, Compass, Bell, User, MessageCircle } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';
import './Sidebar.css';

export const Sidebar = () => {
  const { setCreatePostOpen, logout, notifications } = useAppContext();

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
      </nav>
      <button className="btn-primary post-btn-sidebar" onClick={() => setCreatePostOpen(true)}>Publicar</button>
      <button className="nav-item logout-btn" onClick={logout}>
        <span>Cerrar Sesión</span>
      </button>
    </aside>
  );
};
