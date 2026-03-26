import { useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users, Globe, Clock } from 'lucide-react';
import { PremiumPassModal } from './PremiumPassModal';
import { CommunitySearch } from './CommunitySearch';
import './RightSidebar.css';

export const RightSidebar = () => {
  const { communities, users, currentUser, toggleFollow, joinCommunity, leaveCommunity, posts } = useAppContext();
  const navigate = useNavigate();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const communitiesList = Object.values(communities);

  // Recent Posts logic
  const recentPosts = Object.values(posts)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Suggested communities (fallback to all if list is small)
  const suggestedCommunities = communitiesList.length > 0
    ? communitiesList.filter(c => !currentUser?.joinedCommunityIds.includes(c.id)).slice(0, 4)
    : [];

  const displayCommunities = suggestedCommunities.length > 0 ? suggestedCommunities : communitiesList.slice(0, 4);

  // Suggested users
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

      {/* RECENT POSTS WIDGET */}
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

      {/* SUGGESTED COMMUNITIES */}
      <div className="widget">
        <div className="widget-header">
          <h3><Globe size={18} /> COMUNIDADES POPULARES</h3>
          <button className="icon-btn" onClick={() => navigate('/explore')}><PlusCircle size={18} /></button>
        </div>
        <CommunitySearch />
        <div className="community-list mt-10">
          {displayCommunities.map(c => {
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
          })}
        </div>
      </div>

      {/* SUGGESTED USERS */}
      <div className="widget">
        <div className="widget-header">
          <h3><Users size={18} /> GENTE POPULAR</h3>
        </div>
        <div className="user-list">
          {suggestedUsers.length === 0 && <p className="text-muted">¡Sigues a todos! ✨</p>}
          {suggestedUsers.map(u => (
            <div key={u.id} className="user-item">
              <img src={u.avatar} alt="avatar" onClick={() => navigate(`/profile/${u.id}`)} />
              <div className="u-info">
                <strong onClick={() => navigate(`/profile/${u.id}`)}>u/{u.username?.replace(/^u\//, '')}</strong>
                <span className="user-bio">{u.bio}</span>
              </div>
              <button className="btn-follow" onClick={() => toggleFollow(u.id)}>Seguir</button>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <p>© 2026 Sheddit • Sin Tabú ✨</p>
        <div className="footer-links">
          <span>Privacidad</span> • <span>Términos</span> • <span>Soporte</span>
        </div>
      </div>
    </aside>
  );
};
