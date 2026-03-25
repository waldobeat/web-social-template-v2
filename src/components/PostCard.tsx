import { useState, useMemo } from 'react';
import { type Post } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { Heart, MessageCircle, Share2, Pin, RefreshCw, MoreVertical, Send, Link, BadgeCheck, AtSign } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { RepostMenu } from './RepostMenu';
import { useNavigate } from 'react-router-dom';
import './PostCard.css';

interface Props { post: Post; }

export const PostCard = ({ post }: Props) => {
  const { users, communities, currentUser, toggleLike, joinCommunity, toggleRepost, posts, deletePost, updatePost } = useAppContext();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const author = users[post.authorId];
  const community = communities[post.communityId || ''];
  const originalPost = post.originalPostId ? posts[post.originalPostId] : null;
  const originalAuthor = originalPost ? users[originalPost.authorId] : null;

  if (!author) return null;

  const isJoined = community ? currentUser?.joinedCommunityIds?.includes(community.id) : true;
  const isLikedByMe = post.likedBy?.includes(currentUser?.id || '');
  const isRepostedByMe = post.repostedBy?.includes(currentUser?.id || '');
  const isMyPost = post.authorId === currentUser?.id;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mira este post en SoloChicas ✨',
          text: post.content,
          url: window.location.href,
        });
      } catch (err) { console.error(err); }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updatePost(post.id, editContent);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isGif = post.content.includes('![gif](');
  const gifUrl = isGif ? post.content.match(/!\[gif\]\((.*?)\)/)?.[1] : post.mediaUrl;

  // Extraer menciones del contenido
  const mentions = useMemo(() => {
    const userMentions: string[] = [];
    const communityMentions: string[] = [];

    const mentionRegex = /@u\/(\w+)/g;
    const communityRegex = /@c\/(\w+)/g;

    let match;
    const contentToCheck = post.originalPostId ? (originalPost?.content || '') : post.content;

    while ((match = mentionRegex.exec(contentToCheck)) !== null) {
      userMentions.push(match[1]);
    }
    while ((match = communityRegex.exec(contentToCheck)) !== null) {
      communityMentions.push(match[1]);
    }

    return { users: userMentions, communities: communityMentions };
  }, [post.content, post.originalPostId, originalPost]);

  // Obtener objetos de usuario y comunidad para las menciones
  const mentionedUsers = useMemo(() => {
    return Object.values(users).filter(u => mentions.users.includes(u.username.replace(/^u\//, '')));
  }, [users, mentions.users]);

  const mentionedCommunities = useMemo(() => {
    return Object.values(communities).filter(c => mentions.communities.includes(c.name));
  }, [communities, mentions.communities]);

  const hasMentions = mentionedUsers.length > 0 || mentionedCommunities.length > 0;

  // Función para convertir etiquetas en enlaces
  const renderContentWithLinks = (content: string) => {
    // Reemplazar @u/username con enlace al perfil
    let result = content.replace(/@u\/(\w+)/g, (match, username) => {
      const user = Object.values(users).find(u => u.username.replace(/^u\//, '') === username);
      if (user) {
        return `<a href="/profile/${user.id}" class="content-mention user-mention">@u/${username}</a>`;
      }
      return match;
    });

    // Reemplazar @c/community con enlace a la comunidad
    result = result.replace(/@c\/(\w+)/g, (match, commName) => {
      const comm = Object.values(communities).find(c => c.name.replace(/^c\//, '') === commName);
      if (comm) {
        return `<a href="/community/${comm.id}" class="content-mention community-mention">@c/${commName}</a>`;
      }
      return match;
    });

    return result;
  };

  const displayContent = post.originalPostId ? originalPost?.content : post.content.replace(/!\[gif\]\(.*?\)/, '');

  return (
    <div className={`post-card-wrapper ${post.originalPostId ? 'is-repost' : ''}`}>
      {post.originalPostId && (
        <div className="repost-header">
          <RefreshCw size={14} /> <span>u/{author.username?.replace(/^u\//, '')} reposteó</span>
        </div>
      )}

      <article className={`post-card ${post.isHighlighted ? 'highlighted' : ''}`} style={{ borderLeft: community ? `4px solid ${community.colorTheme}` : '' }}>
        {post.isHighlighted && <div className="highlight-badge"><Pin size={12} /> Destacado</div>}

        <div className="post-header">
          <img
            src={originalAuthor?.avatar || author.avatar}
            alt="author"
            className="avatar"
            onClick={() => navigate(`/profile/${author.id}`)}
            style={{ cursor: 'pointer' }}
          />
          <div className="author-info">
            <div className="username">
              <span onClick={() => navigate(`/profile/${author.id}`)} style={{ cursor: 'pointer' }}>
                u/{originalAuthor?.username?.replace(/^u\//, '') || author.username?.replace(/^u\//, '')}
              </span>
              {/* Show verified badge inline */}
              {author.isVerified && <span className="badge-inline verified"><BadgeCheck size={14} /></span>}
              {community && (
                <>
                  <span
                    onClick={() => navigate(`/community/${community.id}`)}
                    style={{ color: community.colorTheme, fontSize: '13px', marginLeft: 5, cursor: 'pointer' }}
                  >
                    {community.name}
                  </span>
                  {!isJoined && (
                    <button className="btn-join-tiny" onClick={() => joinCommunity(community.id)}>
                      Unirse
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="post-meta">Hace un rato • {post.category || 'general'}</div>
          </div>
          <div className="header-actions" style={{ position: 'relative' }}>
            {isMyPost && (
              <button className="more-btn" onClick={() => setShowOptionsMenu(!showOptionsMenu)}>
                <MoreVertical size={20} />
              </button>
            )}
            {showOptionsMenu && (
              <div className="post-options-menu">
                {(!post.commentIds || post.commentIds.length === 0) && (
                  <button className="opt-item" onClick={() => { setIsEditing(true); setShowOptionsMenu(false); }}>
                    Editar post
                  </button>
                )}
                <button className="opt-item delete" onClick={() => { if (window.confirm('¿Borrar?')) deletePost(post.id); setShowOptionsMenu(false); }}>
                  Borrar post
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="post-edit-area">
            <textarea
              className="post-edit-input"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              autoFocus
            />
            <div className="post-edit-buttons">
              <button className="btn-cancel-mini" onClick={() => setIsEditing(false)}>Cancelar</button>
              <button className="btn-primary-mini" onClick={handleSaveEdit}>Guardar</button>
            </div>
          </div>
        ) : (
          <p className="post-content" dangerouslySetInnerHTML={{ __html: renderContentWithLinks(displayContent || '') }} />
        )}

        {/* Etiquetas mencionadas */}
        {hasMentions && (
          <div className="post-mentions">
            <div className="mentions-header">
              <AtSign size={14} />
              <span>Menciones</span>
            </div>
            <div className="mentions-list">
              {mentionedUsers.map(user => (
                <button
                  key={user.id}
                  className="mention-chip user-mention"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <img src={user.avatar} alt="" className="mention-chip-avatar" />
                  <span>u/{user.username.replace(/^u\//, '')}</span>
                </button>
              ))}
              {mentionedCommunities.map(comm => (
                <button
                  key={comm.id}
                  className="mention-chip community-mention"
                  onClick={() => navigate(`/community/${comm.id}`)}
                >
                  <span className="mention-chip-icon" style={{ background: comm.colorTheme }}>🌐</span>
                  <span>{comm.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {(isGif || post.mediaType === 'gif') && (
          <div className="post-media">
            <img src={gifUrl || ''} alt="gif content" className="post-gif" />
          </div>
        )}

        <div className="post-footer">
          <button className={`action-btn like ${isLikedByMe ? 'active' : ''}`} onClick={() => toggleLike(post.id)}>
            <Heart size={20} fill={isLikedByMe ? 'var(--primary)' : 'none'} color={isLikedByMe ? 'var(--primary)' : 'currentColor'} />
            <span>{post.likesCount}</span>
          </button>

          <button className={`action-btn comment ${showComments ? 'active' : ''}`} onClick={() => setShowComments(!showComments)}>
            <MessageCircle size={20} />
            <span>{post.commentIds ? post.commentIds.length : 0}</span>
          </button>

          <button className={`action-btn repost ${isRepostedByMe ? 'active' : ''}`} onClick={() => isRepostedByMe ? toggleRepost(post.id) : setShowRepostMenu(true)}>
            <RefreshCw size={20} />
            <span>{post.repostCount || 0}</span>
          </button>

          <div className="share-wrapper">
            <button className="action-btn share" onClick={handleShare}>
              <Share2 size={20} />
            </button>
            {showShareMenu && (
              <div className="share-menu">
                <button className="share-option"><Send size={16} /> Enviar a...</button>
                <button className="share-option" onClick={() => { navigator.clipboard.writeText(window.location.href); setShowShareMenu(false); }}><Link size={16} /> Copiar enlace</button>
              </div>
            )}
          </div>
        </div>
      </article>

      {showComments && <CommentSection postId={post.id} />}
      {showRepostMenu && <RepostMenu postId={post.id} onClose={() => setShowRepostMenu(false)} />}
    </div>
  );
};
