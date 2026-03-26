import { NavLink } from 'react-router-dom';
import { Home, Compass, Bell, User, MessageCircle, LogOut } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';
import './Sidebar.css';

export const Sidebar = () => {
  const { setCreatePostOpen, notifications, currentUser, logout } = useAppContext();

  const unreadCount = Object.values(notifications).filter(n => !n.read).length;

  return (
    <div className="sidebar">
      <NavLink to="/" className="logo-container">
        <h1 className="logo-text">Sheddit</h1>
      </NavLink>

      <nav className="nav-menu">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Home /> <span>Inicio</span>
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Compass /> <span>Explorar</span>
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <MessageCircle /> <span>Mensajes</span>
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div style={{ position: 'relative' }}>
            <Bell />
            {unreadCount > 0 && <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </div>
          <span>Notificaciones</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <User /> <span>Perfil</span>
        </NavLink>

        <button className="post-btn-sidebar" onClick={() => setCreatePostOpen(true)}>
          Nuevo Post
        </button>
      </nav>

      {currentUser && (
        <div className="user-sidebar-profile">
          <img src={currentUser.avatar} alt="Avatar" className="user-sb-avatar" />
          <div className="user-sb-info">
            <span className="user-sb-name">{currentUser.username}</span>
            <span className="user-sb-username">online</span>
          </div>
          <button className="logout-btn-mini" onClick={logout} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
