import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useAppContext } from '../context/useAppContext';
import { PostCard } from '../components/PostCard';
import { Tag } from 'lucide-react';
import './Feed.css'; // Reusable styles

export const CommunityPage = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { communities, posts, users, currentUser, joinCommunity, leaveCommunity, setCreatePostOpen } = useAppContext();

  const community = communities[communityId || ''];
  if (!community) return <div className="feed-container">Comunidad no encontrada. ☹️</div>;

  const allPosts = Object.values(posts);
  const commNameNormalized = community.name.replace(/^c\//, '').toLowerCase();

  // Posts publicados EN la comunidad
  const communityPosts = allPosts.filter(p => p.communityId === community.id);

  // Posts que MENcionan esta comunidad (en cualquier lugar)
  // Buscar: @c/belleza, @c/Belleza, @belleza
  const mentioningPosts = allPosts.filter(p => {
    const contentLower = p.content.toLowerCase();
    return contentLower.includes(`@c/${commNameNormalized}`) ||
      contentLower.includes(`@c/${community.name.toLowerCase()}`) ||
      contentLower.includes(`@${commNameNormalized}`);
  });
  // Combinar posts (sin duplicados)
  const displayedPosts = [...communityPosts, ...mentioningPosts.filter(mp => !communityPosts.some(cp => cp.id === mp.id))];

  const isJoined = currentUser?.joinedCommunityIds?.includes(community.id) || false;

  // Extraer etiquetas recientes de TODOS los posts relevantes (de la comunidad y los que la mencionan)
  const recentTags = useMemo(() => {
    const tagMap = new Map<string, { type: 'user' | 'community'; name: string; count: number }>();

    displayedPosts.forEach(post => {
      const content = post.content;
      // Buscar menciones de usuarios
      const userMatches = content.match(/@u\/(\w+)/g) || [];
      userMatches.forEach(match => {
        const username = match.replace('@u/', '');
        const existing = tagMap.get(username);
        if (existing) {
          existing.count++;
        } else {
          tagMap.set(username, { type: 'user', name: username, count: 1 });
        }
      });

      // Buscar menciones de comunidades
      const commMatches = content.match(/@c\/(\w+)/g) || [];
      commMatches.forEach(match => {
        const commName = match.replace('@c/', '');
        const existing = tagMap.get(commName);
        if (existing) {
          existing.count++;
        } else {
          tagMap.set(commName, { type: 'community', name: commName, count: 1 });
        }
      });
    });

    // Ordenar por cantidad y limitar a 10
    return Array.from(tagMap.values()).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [communityPosts]);

  // Obtener info de usuarios mencionados
  const mentionedUsers = useMemo(() => {
    const userTags = recentTags.filter(t => t.type === 'user');
    return Object.values(users).filter(u => userTags.some(t => t.name === u.username.replace(/^u\//, '')));
  }, [recentTags, users]);

  return (
    <div className="feed-container">
      <div className="feed-header community-page-header" style={{ borderBottom: `4px solid ${community.colorTheme}` }}>
        <div className="feed-title-row">
          <div className="community-info-large">
            <div className="comm-dot-large" style={{ backgroundColor: community.colorTheme }} />
            <div>
              <h2>{community.name}</h2>
              <p className="text-muted">{community.description}</p>
              <div className="comm-meta-row">
                <span><strong>{community.memberCount || 0}</strong> miembros</span>
              </div>
            </div>
          </div>
          <button
            className={`btn-join-large ${isJoined ? 'joined' : 'primary'}`}
            onClick={() => isJoined ? leaveCommunity(community.id) : joinCommunity(community.id)}
          >
            {isJoined ? 'Unido' : 'Unirse'}
          </button>
        </div>
      </div>

      {/* Etiquetas Recientes */}
      {recentTags.length > 0 && (
        <div className="community-tags-section">
          <div className="tags-section-header">
            <Tag size={16} />
            <span>Etiquetas Recientes</span>
          </div>
          <div className="tags-list">
            {recentTags.map((tag, index) => {
              if (tag.type === 'user') {
                const user = mentionedUsers.find(u => u.username.replace(/^u\//, '') === tag.name);
                return user ? (
                  <a key={index} href={`/profile/${user.id}`} className="tag-chip user-tag">
                    <img src={user.avatar} alt="" className="tag-avatar" />
                    <span>u/{tag.name}</span>
                    <span className="tag-count">{tag.count}</span>
                  </a>
                ) : null;
              } else {
                const comm = Object.values(communities).find(c => c.name === tag.name);
                return (
                  <a key={index} href={`/community/${comm?.id || ''}`} className="tag-chip community-tag" style={comm ? { borderColor: comm.colorTheme } : {}}>
                    <span className="tag-icon" style={comm ? { background: comm.colorTheme } : {}}>🌐</span>
                    <span>c/{tag.name}</span>
                    <span className="tag-count">{tag.count}</span>
                  </a>
                );
              }
            })}
          </div>
        </div>
      )}

      {isJoined && (
        <div className="create-post-trigger" onClick={() => setCreatePostOpen(true)}>
          <img src={currentUser?.avatar} alt="me" className="trigger-avatar" />
          <div className="trigger-input">Publicar en {community.name}... ✨</div>
        </div>
      )}

      <div className="posts-list">
        {displayedPosts.length > 0 ? (
          displayedPosts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="no-posts-msg">Aún no hay publicaciones en esta comunidad. ¡Sé la primera! ✨</p>
        )}
      </div>
    </div>
  );
};
