import { useAppContext } from '../context/useAppContext';
import { Compass, Users } from 'lucide-react';
import './Explore.css';

export const Explore = () => {
  const { communities, currentUser, joinCommunity, leaveCommunity } = useAppContext();

  return (
    <div className="explore-container">
      <div className="explore-header">
        <h2><Compass size={24} color="var(--primary)" /> Explorar Comunidades</h2>
      </div>

      <div className="communities-grid">
        {Object.values(communities).map(c => {
          const isJoined = currentUser?.joinedCommunityIds?.includes(c.id);
          return (
            <div key={c.id} className="explore-community-card" style={{ borderTop: `4px solid ${c.colorTheme || 'var(--primary)'}` }}>
              <h3>{c.name} <span style={{ fontSize: 12, fontWeight: 'normal', color: '#888' }}>(Admin: {c.botId})</span></h3>
              <p>{c.description}</p>
              <div className="c-stats">
                <Users size={16} /> <span>{c.memberCount} miembros</span>
              </div>
              <div className="c-actions">
                <button
                  className={`explore-join-btn ${isJoined ? 'joined' : ''}`}
                  style={{ '--comm-color': c.colorTheme } as React.CSSProperties}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
