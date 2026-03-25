import { useAppContext } from '../context/useAppContext';
import { User, X } from 'lucide-react';
import './RepostMenu.css';

interface Props {
  postId: string;
  onClose: () => void;
}

export const RepostMenu = ({ postId, onClose }: Props) => {
  const { currentUser, communities, toggleRepost } = useAppContext();

  const joinedCommunities = Object.values(communities).filter(c =>
    currentUser?.joinedCommunityIds?.includes(c.id)
  );

  const handleRepost = async (communityId?: string) => {
    await toggleRepost(postId, communityId);
    onClose();
  };

  return (
    <div className="repost-menu-overlay" onClick={onClose}>
      <div className="repost-menu" onClick={e => e.stopPropagation()}>
        <div className="repost-menu-header">
          <label>Compartir en...</label>
          <button className="close-mini-btn" onClick={onClose}><X size={14} /></button>
        </div>

        <button className="repost-option-btn" onClick={() => handleRepost()}>
          <User size={18} color="var(--primary)" />
          <span>Mi Perfil ✨</span>
        </button>

        {joinedCommunities.length > 0 && (
          <div className="repost-section-title">Comunidades</div>
        )}

        <div className="repost-communities-list">
          {joinedCommunities.map(c => (
            <button key={c.id} className="repost-option-btn" onClick={() => handleRepost(c.id)}>
              <div className="comm-mini-dot" style={{ backgroundColor: c.colorTheme }} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
