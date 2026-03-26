import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { PostCard } from '../components/PostCard';
import { type Post } from '../data/mockData';
import { Users, Plus, Globe, Edit3, Sparkles, BadgeCheck, LogOut } from 'lucide-react';
import { EditProfileModal } from '../components/EditProfileModal';
import { UserBadge } from '../components/UserBadge';
import './Profile.css';

export const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser, posts, users, toggleFollow, communities, logout, grantPremiumRole } = useAppContext();
  const [showEditModal, setShowEditModal] = useState(false);

  const displayedUser = userId ? users[userId] : currentUser;

  if (!displayedUser) return <div className="profile-container">Usuario no encontrado. ☹️</div>;

  const myPosts = Object.values(posts).filter((p: Post) => p.authorId === displayedUser.id);
  const followersList = (displayedUser.followers || []).map((id: string) => users[id]).filter(Boolean);
  const followingList = (displayedUser.following || []).map((id: string) => users[id]).filter(Boolean);
  const isCurrentlyFollowing = currentUser?.following?.includes(displayedUser.id) || false;
  const isMe = currentUser?.id === displayedUser.id;
  const isAdmin = (currentUser as any)?.email === 'waldobeatmaker@gmail.com' || currentUser?.username === 'u/Sheddit';

  // Get user's communities
  const myCommunities = Object.values(communities).filter(c => c.ownerId === displayedUser.id);
  const joinedCommunities = Object.values(communities).filter(c =>
    displayedUser.joinedCommunityIds?.includes(c.id) && c.ownerId !== displayedUser.id
  );

  return (
    <div className="profile-container">
      {showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} />}

      <div className="profile-header">
        <img src={displayedUser.avatar} alt="avatar" className="profile-avatar" />
        <div className="profile-info">
          <div className="profile-title-row">
            <h2>u/{displayedUser.username?.replace(/^u\//, '')}</h2>
            {displayedUser.isVerified && <BadgeCheck size={20} color="#1DA1F2" />}
            {displayedUser.isPremium && <UserBadge type="premium" size="medium" />}
            {isMe && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="edit-profile-btn"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit3 size={16} /> Editar
                </button>
                <button
                  className="btn-follow following"
                  onClick={logout}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff4d6d'; e.currentTarget.style.color = '#ff4d6d'; e.currentTarget.style.background = '#fff0f3'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut size={16} /> Salir
                </button>
              </div>
            )}
            {!isMe && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className={`btn-follow ${isCurrentlyFollowing ? 'following' : 'primary'}`}
                  onClick={() => toggleFollow(displayedUser.id)}
                >
                  {isCurrentlyFollowing ? (
                    <>
                      <span className="following-text">Siguiendo</span>
                      <span className="unfollow-text">Dejar de seguir</span>
                    </>
                  ) : 'Seguir'}
                </button>
                
                {isAdmin && !displayedUser.isPremium && (
                  <button
                    className="btn-primary"
                    onClick={() => grantPremiumRole(displayedUser.id)}
                    style={{ background: 'var(--warning)', color: '#fff', fontSize: '13px' }}
                  >
                    ⭐ Hacer Premium
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="profile-bio">{displayedUser.bio}</p>
          <div className="stats">
            <span><strong>{followersList.length}</strong> Seguidores</span>
            <span><strong>{followingList.length}</strong> Siguiendo</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        {/* Communities Section - Improved Grid Layout */}
        <div className="communities-section">
          {/* My Communities (Owner) */}
          <div className="community-category">
            <div className="category-header">
              <span className="category-icon">✨</span>
              <h3>Mi Comunidad</h3>
              <span className="category-count">{myCommunities.length}</span>
            </div>
            <div className="communities-grid-3">
              {myCommunities.length > 0 ? (
                myCommunities.map(c => (
                  <Link
                    key={c.id}
                    to={`/community/${c.id}`}
                    className="community-card-grid"
                    style={{ borderTopColor: c.colorTheme }}
                  >
                    <div className="community-card-top" style={{ backgroundColor: c.colorTheme }}>
                      <Sparkles size={16} color="white" />
                    </div>
                    <div className="community-card-body">
                      <div className="community-card-header">
                        <span className="community-dot" style={{ backgroundColor: c.colorTheme }} />
                        <span className="community-name">c/{c.name}</span>
                      </div>
                      <p className="community-description">{c.description}</p>
                      <div className="community-card-footer">
                        <span className="member-count">
                          <Users size={12} />
                          {c.memberCount} miembros
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-communities full-width">
                  <p>No has creado comunidades aún.</p>
                  <Link to="/" className="create-community-link">
                    <Plus size={14} /> Crear comunidad
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Joined Communities (Member) - Grid Layout */}
          <div className="community-category">
            <div className="category-header">
              <span className="category-icon">🌐</span>
              <h3>Mis Redes</h3>
              <span className="category-count">{joinedCommunities.length}</span>
            </div>
            <div className="communities-grid-3">
              {joinedCommunities.length > 0 ? (
                joinedCommunities.map(c => (
                  <Link
                    key={c.id}
                    to={`/community/${c.id}`}
                    className="community-card-grid"
                    style={{ borderTopColor: c.colorTheme }}
                  >
                    <div className="community-card-top" style={{ backgroundColor: c.colorTheme }}>
                      <Globe size={16} color="white" />
                    </div>
                    <div className="community-card-body">
                      <div className="community-card-header">
                        <span className="community-dot" style={{ backgroundColor: c.colorTheme }} />
                        <span className="community-name">c/{c.name}</span>
                      </div>
                      <p className="community-description">{c.description}</p>
                      <div className="community-card-footer">
                        <span className="member-count">
                          <Users size={12} />
                          {c.memberCount} miembros
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-communities full-width">
                  <p>No te has unido a otras comunidades.</p>
                  <Link to="/explore" className="create-community-link">
                    <Globe size={14} /> Explorar comunidades
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Posts Section */}
        <div className="my-posts">
          <div className="category-header">
            <span className="category-icon">📝</span>
            <h3>Mis Publicaciones</h3>
            <span className="category-count">{myPosts.length}</span>
          </div>
          {myPosts.length > 0 ? (
            myPosts.map(p => <PostCard key={p.id} post={p} />)
          ) : (
            <p className="empty-posts">No has publicado nada aún. ¡Comparte algo con la comunidad! ✨</p>
          )}
        </div>
      </div>
    </div>
  );
};
