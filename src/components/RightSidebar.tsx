import { useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import { useNavigate } from 'react-router-dom';
import { Users, Globe, Clock, Sparkles, TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';
import { PremiumPassModal } from './PremiumPassModal';
import { CommunitySearch } from './CommunitySearch';
import './RightSidebar.css';

export const RightSidebar = () => {
  const { communities, users, currentUser, toggleFollow, joinCommunity, leaveCommunity, posts } = useAppContext();
  const navigate = useNavigate();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const communitiesList = Object.values(communities);

  // FALLBACK DATA (Ensures it never looks empty)
  const fallbackCommunities = [
    { id: 'c1', name: 'c/Anuncios', members: '12k', color: '#00E5FF' },
    { id: 'c2', name: 'c/Ayuda', members: '5k', color: '#FF3366' },
  ];

  const fallbackUsers = [
    { id: 'u1', username: 'Sheddit Team', bio: 'Cuenta oficial de soporte y noticias.', avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712010.png' }
  ];

  // Dynamic Data
  const recentPosts = Object.values(posts)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const suggestedCommunities = communitiesList.length > 0
    ? communitiesList.filter(c => !currentUser?.joinedCommunityIds.includes(c.id)).slice(0, 4)
    : [];

  const displayCommunities = suggestedCommunities.length > 0 ? suggestedCommunities : [];

  const suggestedUsers = Object.values(users).filter(u =>
    u.id !== currentUser?.id &&
    !currentUser?.following.includes(u.id)
  ).slice(0, 5);

  const followersCount = currentUser?.followers?.length || 0;

  return (
    <aside className="right-sidebar">
      {showPremiumModal && (
        <PremiumPassModal
          onClose={() => setShowPremiumModal(false)}
          followersCount={followersCount}
        />
      )}

      {/* 1. PREMIUM STATUS CARD */}
      <div className="premium-card" onClick={() => setShowPremiumModal(true)}>
        <div className="premium-accent" />
        <div className="premium-content">
          <div className="premium-icon-box">
            <Sparkles size={20} className="gold-icon" />
          </div>
          <div className="premium-info">
            <h4>Pase Premium Gold</h4>
            <p>Acceso sin tabúes y funciones exclusivas.</p>
          </div>
          <ChevronRight size={18} />
        </div>
      </div>

      {/* 2. RECENT POSTS */}
      {recentPosts.length > 0 && (
        <div className="widget">
          <div className="widget-header">
            <h3><Clock size={16} /> PUBLICACIONES RECIENTES</h3>
            <button className="clear-btn" onClick={() => navigate('/')}>Borrar</button>
          </div>
          <div className="recent-posts-list">
            {recentPosts.map(p => {
              const postAuthor = users[p.authorId];
              const postComm = communities[p.communityId || ''];
              return (
                <div key={p.id} className="recent-post-item" onClick={() => navigate('/')}>
                  <div className="rp-header">
                    <img src={postAuthor?.avatar} alt="" className="rp-avatar" />
                    <span>{postComm?.name || p.category} • hace un rato</span>
                  </div>
                  <p className="rp-content">{p.content.slice(0, 80)}...</p>
                  <div className="rp-stats">
                    {p.likesCount} upvotes • {p.commentIds?.length || 0} comentarios
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TRENDING CATEGORIES */}
      <div className="widget">
        <div className="widget-header">
          <h3><TrendingUp size={16} /> TENDENCIAS HOY</h3>
        </div>
        <div className="trending-tags">
          <span className="tag-item">#Libertad</span>
          <span className="tag-item">#Sheddit</span>
          <span className="tag-item">#Comunidad</span>
          <span className="tag-item">#SinTabu</span>
          <span className="tag-item">#ArteDigital</span>
        </div>
      </div>

      {/* 4. SUGGESTED COMMUNITIES */}
      <div className="widget">
        <div className="widget-header">
          <h3><Globe size={18} /> COMUNIDADES SUGERIDAS</h3>
        </div>
        <CommunitySearch />
        <div className="community-list mt-10">
          {displayCommunities.length > 0 ? displayCommunities.map(c => {
            const isJoined = currentUser?.joinedCommunityIds.includes(c.id);
            return (
              <div key={c.id} className="community-item" onClick={() => navigate(`/community/${c.id}`)}>
                <div className="c-color-dot" style={{ background: c.colorTheme }} />
                <div className="c-info">
                  <strong>{c.name}</strong>
                  <span>{c.memberCount.toLocaleString()} miembros</span>
                </div>
                <button
                  className={`btn-join ${isJoined ? 'joined' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    isJoined ? leaveCommunity(c.id) : joinCommunity(c.id);
                  }}
                >
                  {isJoined ? 'Unido' : 'Unirse'}
                </button>
              </div>
            );
          }) : (
            fallbackCommunities.map(c => (
              <div key={c.id} className="community-item fallback">
                <div className="c-color-dot" style={{ background: c.color }} />
                <div className="c-info">
                  <strong>{c.name}</strong>
                  <span>{c.members} miembros</span>
                </div>
                <span className="official-badge">OFICIAL</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. SUGGESTED USERS */}
      <div className="widget">
        <div className="widget-header">
          <h3><Users size={18} /> GENTE POPULAR</h3>
        </div>
        <div className="user-list">
          {suggestedUsers.length > 0 ? suggestedUsers.map(u => (
            <div key={u.id} className="user-item">
              <img src={u.avatar} alt="avatar" />
              <div className="u-info">
                <strong>u/{u.username?.replace(/^u\//, '')}</strong>
                <span className="user-bio">{u.bio}</span>
              </div>
              <button className="btn-follow" onClick={() => toggleFollow(u.id)}>Seguir</button>
            </div>
          )) : (
            fallbackUsers.map(u => (
              <div key={u.id} className="user-item fallback">
                <img src={u.avatar} alt="avatar" />
                <div className="u-info">
                  <strong>{u.username} <ShieldCheck size={12} className="verified" /></strong>
                  <span className="user-bio">{u.bio}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <p>© 2026 Sheddit • Sin Tabú ✨</p>
        <div className="footer-links">
          <span>Privacidad</span> • <span>Términos</span> • <span>Soporte</span>
        </div>
      </div>
    </aside>
  );
};
