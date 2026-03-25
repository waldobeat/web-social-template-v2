import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, MessageCircle, BadgeCheck, Users, Globe } from 'lucide-react';
import { PremiumPassModal } from './PremiumPassModal';
import { CommunitySearch } from './CommunitySearch';
import './RightSidebar.css';

const THEME_COLORS = ['#FF8DA1', '#B39DFF', '#FF7F50', '#A8D8A8', '#F4A261', '#E9C46A', '#E63946', '#E76F51'];
const FOLLOWERS_REQUIRED = 100;

export const RightSidebar = () => {
  const { communities, users, currentUser, toggleFollow, addCommunity, sendMessage, joinCommunity, leaveCommunity } = useAppContext();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommColor, setNewCommColor] = useState('#B39DFF');
  const [isCreating, setIsCreating] = useState(false);

  const communitiesList = Object.values(communities);

  // Suggested communities (not joined yet, based on what user follows)
  const suggestedCommunities = communitiesList.filter(c =>
    !currentUser?.joinedCommunityIds.includes(c.id)
  ).slice(0, 5);

  // Suggested users (not following yet)
  const suggestedUsers = Object.values(users).filter(u =>
    u.id !== currentUser?.id &&
    !currentUser?.following.includes(u.id)
  );

  const followingUsers = Object.values(users).filter(u =>
    currentUser?.following.includes(u.id)
  );

  // Check if user can create community
  const followersCount = currentUser?.followers?.length || 0;
  const canCreateCommunity = followersCount >= FOLLOWERS_REQUIRED || currentUser?.isPremium;
  const followersNeeded = Math.max(0, FOLLOWERS_REQUIRED - followersCount);

  const handleCreateClick = () => {
    if (canCreateCommunity) {
      setShowModal(true);
    } else {
      setShowPremiumModal(true);
    }
  };

  const handleCreate = async () => {
    if (!newCommName.trim() || isCreating) return;
    setIsCreating(true);

    try {
      await addCommunity({
        name: `c/${newCommName}`,
        description: newCommDesc || 'Comunidad nueva 💖',
        memberCount: 1,
        botId: 'Bot_Admin',
        colorTheme: newCommColor,
        ownerId: currentUser?.id || 'system',
        memberIds: [currentUser?.id || ''],
      });
      setNewCommName('');
      setNewCommDesc('');
      setNewCommColor('#B39DFF');
      setShowModal(false);
    } catch (error) {
      console.error('Error creating community:', error);
      alert('Error al crear la comunidad. Intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendFirstMessage = (userId: string) => {
    sendMessage(userId, '¡Hola! Vi tu perfil 💖');
    navigate('/messages');
  };

  return (
    <aside className="right-sidebar">
      {showPremiumModal && (
        <PremiumPassModal
          onClose={() => setShowPremiumModal(false)}
          followersCount={followersCount}
        />
      )}

      <div className="widget">
        <div className="widget-header">
          <h3>Comunidades</h3>
          <button
            className={`icon-btn ${!canCreateCommunity ? 'locked' : ''}`}
            onClick={handleCreateClick}
            title={canCreateCommunity ? 'Crear comunidad' : `Necesitas ${followersNeeded} seguidores más`}
          >
            <PlusCircle size={20} />
          </button>
        </div>

        {/* Community Search */}
        <CommunitySearch />
        <div className="community-list">
          {communitiesList.map(c => {
            const isJoined = currentUser?.joinedCommunityIds.includes(c.id);
            return (
              <div key={c.id} className="community-item" onClick={() => navigate(`/community/${c.id}`)} style={{ cursor: 'pointer' }}>
                <div className="c-color-dot" style={{ background: c.colorTheme }} />
                <div className="c-info">
                  <strong style={{ color: c.colorTheme }}>{c.name}</strong>
                  <span>{c.memberCount.toLocaleString()} miembros</span>
                </div>
                <button
                  className={`btn-join ${isJoined ? 'joined' : ''}`}
                  onClick={() => isJoined ? leaveCommunity(c.id) : joinCommunity(c.id)}
                >
                  {isJoined ? (
                    <>
                      <span className="joined-text">Unido</span>
                      <span className="leave-text">Salir</span>
                    </>
                  ) : 'Unirse'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Communities */}
      {suggestedCommunities.length > 0 && (
        <div className="widget">
          <div className="widget-header">
            <Globe size={18} />
            <h3>Comunidades Sugeridas</h3>
          </div>
          <div className="community-list">
            {suggestedCommunities.map(c => (
              <div key={c.id} className="community-item" onClick={() => navigate(`/community/${c.id}`)} style={{ cursor: 'pointer' }}>
                <div className="c-color-dot" style={{ background: c.colorTheme }} />
                <div className="c-info">
                  <strong style={{ color: c.colorTheme }}>{c.name}</strong>
                  <span>{c.memberCount.toLocaleString()} miembros</span>
                </div>
                <button
                  className="btn-join"
                  onClick={(e) => {
                    e.stopPropagation();
                    joinCommunity(c.id);
                  }}
                >
                  Unirse
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Users */}
      <div className="widget">
        <div className="widget-header">
          <Users size={18} />
          <h3>Usuarios Sugeridos</h3>
        </div>
        <div className="user-list">
          {suggestedUsers.length === 0 && <p className="text-muted" style={{ fontSize: 13, marginTop: 10 }}>¡Sigues a todas! 🥰</p>}
          {suggestedUsers.slice(0, 5).map(u => (
            <div key={u.id} className="user-item">
              <img src={u.avatar} alt="avatar" onClick={() => navigate(`/profile/${u.id}`)} style={{ cursor: 'pointer' }} />
              <div className="u-info">
                <strong onClick={() => navigate(`/profile/${u.id}`)} style={{ cursor: 'pointer' }}>u/{u.username?.replace(/^u\//, '')}</strong>
                {u.isVerified && <BadgeCheck size={14} color="#1DA1F2" style={{ marginLeft: 4 }} />}
                <span className="user-bio">{u.bio}</span>
              </div>
              <button className="btn-follow" onClick={() => toggleFollow(u.id)}>Seguir</button>
            </div>
          ))}
        </div>
      </div>

      {/* Following (optional - can be hidden) */}
      {followingUsers.length > 0 && followingUsers.length <= 5 && (
        <div className="widget">
          <h3>Siguiendo</h3>
          <div className="user-list">
            {followingUsers.map(u => (
              <div key={u.id} className="user-item">
                <img src={u.avatar} alt="avatar" onClick={() => navigate(`/profile/${u.id}`)} style={{ cursor: 'pointer' }} />
                <div className="u-info">
                  <strong onClick={() => navigate(`/profile/${u.id}`)} style={{ cursor: 'pointer' }}>u/{u.username?.replace(/^u\//, '')}</strong>
                  {u.isVerified && <BadgeCheck size={14} color="#1DA1F2" style={{ marginLeft: 4 }} />}
                </div>
                <button className="icon-btn" title="Enviar mensaje" onClick={() => handleSendFirstMessage(u.id)}>
                  <MessageCircle size={18} color="var(--secondary)" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Community Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !isCreating && setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>✨ Crear Comunidad</h3>
            <label>Nombre de la comunidad</label>
            <input
              type="text"
              placeholder="Ej: Viajes, Arte, Mascotas..."
              value={newCommName}
              onChange={e => setNewCommName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              disabled={isCreating}
              maxLength={30}
            />
            <span className="input-hint">Solo letras, números y guiones bajos</span>
            <label>Descripción</label>
            <input
              type="text"
              placeholder="De qué trata tu comunidad..."
              value={newCommDesc}
              onChange={e => setNewCommDesc(e.target.value)}
              disabled={isCreating}
              maxLength={100}
            />
            <label>Color temático</label>
            <div className="color-picker">
              {THEME_COLORS.map(color => (
                <button
                  key={color}
                  className={`color-dot ${newCommColor === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setNewCommColor(color)}
                  disabled={isCreating}
                />
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="btn-cancel" disabled={isCreating}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate} disabled={!newCommName.trim() || isCreating}>
                {isCreating ? (
                  <>
                    <span className="loading-spinner" />Creando...
                  </>
                ) : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
