import { useState, useRef, useMemo } from 'react';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { useAppContext } from '../context/useAppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { onNewContent } from '../services/botEngine';
import { Smile, X, Send, Image as ImageIcon, AtSign } from 'lucide-react';
import './CreatePostModal.css';

interface Props {
  onClose: () => void;
}

export const CreatePostModal = ({ onClose }: Props) => {
  const { addPost, communities, currentUser } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar contexto
  const pathParts = location.pathname.split('/');
  const isInCommunityPage = pathParts[1] === 'community' && pathParts[2];
  const communityIdFromUrl = isInCommunityPage ? pathParts[2] : '';
  const communityFromUrl = communities[communityIdFromUrl];

  const joinedCommunities = Object.values(communities).filter(c =>
    currentUser?.joinedCommunityIds?.includes(c.id)
  );
  const isMemberOfCommunity = joinedCommunities.some(c => c.id === communityIdFromUrl);

  // Estado simple
  const [content, setContent] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Extraer menciones del contenido
  const { userMentions, communityMentions } = useMemo(() => {
    const userMatches = content.match(/@u\/(\w+)/g) || [];
    const commMatches = content.match(/@c\/(\w+)/g) || [];
    return {
      userMentions: userMatches.map(m => m.replace('@u/', '')),
      communityMentions: commMatches.map(m => m.replace('@c/', ''))
    };
  }, [content]);

  // Detectar si hay menciones pendientes
  const hasUserMentions = userMentions.length > 0;
  const hasCommunityMentions = communityMentions.length > 0;

  const handleEmoji = (emoji: EmojiClickData) => {
    setContent(prev => prev + emoji.emoji);
    setShowEmoji(false);
    textAreaRef.current?.focus();
  };

  const handlePublish = async () => {
    if (!content.trim() || !currentUser) return;

    setIsPosting(true);

    // Verificar moderación
    const moderation = await onNewContent(content, '');
    if (!moderation.isApproved) {
      alert(`🤖 ${moderation.reason}`);
      setIsPosting(false);
      return;
    }

    // Determinar communityId
    let finalCommunityId = 'feed';
    let category = 'Mi Feed';

    if (isInCommunityPage && isMemberOfCommunity) {
      finalCommunityId = communityIdFromUrl;
      category = communityFromUrl?.name || 'Comunidad';
    }

    // Crear post con etiquetas pendientes
    await addPost({
      authorId: currentUser.id,
      communityId: finalCommunityId,
      content: content,
      category: category,
      isHighlighted: false,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      likedBy: [],
      commentIds: [],
      repostCount: 0,
      repostedBy: [],
      // Etiquetas pendientes
      pendingUserTags: hasUserMentions ? userMentions : [],
      pendingCommunityTags: hasCommunityMentions ? communityMentions : [],
      approvedUserTags: [],
      approvedCommunityTags: [],
    });

    setIsPosting(false);
    onClose();
    navigate('/');
  };

  return (
    <div className="cpm-overlay" onClick={onClose}>
      <div className="cpm-modal cpm-simple" onClick={e => e.stopPropagation()}>

        {/* Header simple */}
        <div className="cpm-header">
          <h2>
            {isInCommunityPage && isMemberOfCommunity
              ? `Publicar en c/${communityFromUrl?.name}`
              : '¿Qué estás pensando?'}
          </h2>
          <button className="cpm-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Área de texto simple */}
        <div className="cpm-simple-content">
          <textarea
            ref={textAreaRef}
            className="cpm-simple-input"
            placeholder={isInCommunityPage && isMemberOfCommunity
              ? `Publica en c/${communityFromUrl?.name}...`
              : "¿Qué estás pensando? Usa @u/usuario o @c/comunidad para etiquetar"}
            value={content}
            onChange={e => setContent(e.target.value)}
            autoFocus
          />
        </div>

        {/* Info de etiquetas */}
        {(hasUserMentions || hasCommunityMentions) && (
          <div className="cpm-tags-info">
            <AtSign size={14} />
            <span>
              {hasUserMentions && `${userMentions.length} usuario(s) etiquetado(s)`}
              {hasUserMentions && hasCommunityMentions && ' • '}
              {hasCommunityMentions && `${communityMentions.length} comunidad(es) etiquetada(s)`}
            </span>
            <span className="cpm-tags-hint">
              (Requiere aprobación)
            </span>
          </div>
        )}

        {/* Acciones */}
        <div className="cpm-simple-actions">
          <div className="cpm-actions-left">
            <div style={{ position: 'relative' }}>
              <button
                className="cpm-action-btn"
                onClick={() => setShowEmoji(!showEmoji)}
                title="Emoji"
              >
                <Smile size={22} />
              </button>
              {showEmoji && (
                <div className="cpm-emoji-pop">
                  <EmojiPicker onEmojiClick={handleEmoji} height={350} width={320} />
                </div>
              )}
            </div>

            <button className="cpm-action-btn" title="Imagen">
              <ImageIcon size={22} />
            </button>
          </div>

          <button
            className="cpm-publish-btn-simple"
            onClick={handlePublish}
            disabled={!content.trim() || isPosting}
          >
            {isPosting ? 'Publicando...' : 'Publicar'}
            <Send size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};
