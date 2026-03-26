import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Bell, User, MessageCircle, LogOut, PlusCircle, Globe, Zap, Hash } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';
import './Sidebar.css';

export const Sidebar = () => {
  const { setCreatePostOpen, notifications, currentUser, logout, communities } = useAppContext();
  const navigate = useNavigate();

  const unreadCount = Object.values(notifications).filter(n => !n.read).length;

  // Last 3 joined communities for "RECIENTES"
  const recentCommunities = (currentUser?.joinedCommunityIds || [])
    .map(id => communities[id])
    .filter(Boolean)
    .slice(0, 3);

  // Topics/Categories for "TEMAS"
  const topics = [
    { name: 'Arte', icon: <Hash size={16} /> },
    { name: 'Moda', icon: <Hash size={16} /> },
    { name: 'Gym', icon: <Hash size={16} /> },
    { name: 'Gaming', icon: <Hash size={16} /> }
  ];

  return (
    <div className="sidebar">
      <NavLink to="/" className="logo-container">
        <h1 className="logo-text">Sheddit</h1>
      </NavLink>

      <div className="sidebar-scrollable">
        {/* SECTION: REDDIT (Navigation) */}
        <div className="sidebar-section">
          <span className="section-label">SHEDDIT</span>
          <nav className="nav-menu">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Home /> <span>Inicio</span>
            </NavLink>
            <NavLink to="/explore" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Zap /> <span>Popular</span>
            </NavLink>
            <NavLink to="/explore" className="nav-item">
              <Compass /> <span>Explorar</span>
            </NavLink>
            <NavLink to="/messages" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <MessageCircle /> <span>Mensajes</span>
            </NavLink>
          </nav>
        </div>

        {/* SECTION: RECIENTES (Joined Communities) */}
        {recentCommunities.length > 0 && (
          <div className="sidebar-section">
            <span className="section-label">RECIENTES</span>
            <div className="nav-menu">
              {recentCommunities.map(c => (
                <NavLink 
                  key={c.id} 
                  to={`/community/${c.id}`} 
                  className="nav-item recent-item"
                >
                  <div className="c-mini-dot" style={{ background: c.colorTheme }} />
                  <span>{c.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: TEMAS (Topics) */}
        <div className="sidebar-section">
          <span className="section-label">TEMAS</span>
          <div className="nav-menu">
            {topics.map(t => (
              <div key={t.name} className="nav-item topic-item" onClick={() => navigate('/explore')}>
                {t.icon} <span>{t.name}</span>
              </div>
            ))}
            <NavLink to="/explore" className="nav-item see-more">
              <span>Ver más temas...</span>
            </NavLink>
          </div>
        </div>

        {/* UTILS */}
        <div className="sidebar-section">
          <button className="nav-item create-comm-item" onClick={() => navigate('/explore')}>
            <PlusCircle /> <span>Crear una comunidad</span>
          </button>
        </div>

        <button className="post-btn-sidebar" onClick={() => setCreatePostOpen(true)}>
          Nuevo Post
        </button>
      </div>

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
