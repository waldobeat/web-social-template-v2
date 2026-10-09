import { useState, useEffect } from 'react';
import { ref, push, set, get, increment, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Share2, Globe, Lock, Send, Trash2, X } from 'lucide-react';
import type { Post, Comment } from '../types';

export type { Post };

export const CATEGORIES = [
  { id: 'general', label: 'General', icon: '💬', color: 'text-gray-400' },
  { id: 'cashea', label: 'Cashea', icon: '🛍️', color: 'text-violet-400' },
  { id: 'krece', label: 'Krece', icon: '📱', color: 'text-emerald-400' },
  { id: 'credix', label: 'Credix', icon: '🏦', color: 'text-amber-400' },
  { id: 'consejos', label: 'Consejos', icon: '💡', color: 'text-teal-400' },
  { id: 'experiencias', label: 'Experiencias', icon: '⭐', color: 'text-yellow-400' },
  { id: 'noticias', label: 'Noticias', icon: '📰', color: 'text-blue-400' },
];

function timeAgo(ts: number) {
  if (!ts) return 'ahora';
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  const h = Math.floor(d / 3600000);
  const days = Math.floor(d / 86400000);
  if (m < 1) return 'ahora';
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (days < 7) return `${days}d`;
  return new Date(ts).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
}

function fullDate(ts: number) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('es-VE', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true, 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

function getCat(id: string) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
  showDeleteOption?: boolean;
  isSingleView?: boolean;
}

export default function PostCard({ post, onDelete, showDeleteOption = false, isSingleView = false }: PostCardProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  
  // Comments state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loaded, setLoaded] = useState(false);
  
  // Image modal state
  const [imgModalOpen, setImgModalOpen] = useState(false);

  const cat = getCat(post.category);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const postRef = ref(db, `posts/${post.id}`);
    const unsub = onValue(postRef, (snap) => {
      const data = snap.val();
      if (data) {
        setLikesCount(data.likesCount || 0);
        setCommentsCount(data.commentsCount || 0);
      }
    });
    return () => unsub();
  }, [post.id]);

  useEffect(() => {
    const handlePopState = () => {
      if (imgModalOpen) {
        setImgModalOpen(false);
        document.body.style.overflow = 'auto';
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [imgModalOpen]);

  const loadComments = async () => {
    if (!loaded) {
      const snap = await get(ref(db, `comments/${post.id}`));
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, v]: [string, any]) => ({ id, ...v }));
        list.sort((a: any, b: any) => a.timestamp - b.timestamp);
        setComments(list as Comment[]);
      }
      setLoaded(true);
    }
  };

  const handleToggleComments = () => {
    if (!commentsOpen) loadComments();
    setCommentsOpen(!commentsOpen);
  };

  const sendComment = async () => {
    if (!commentText.trim() || !user) return;
    const commentRef = push(ref(db, `comments/${post.id}`));
    const newComment: Omit<Comment, 'id'> = {
      authorId: user.uid,
      authorName: user.displayName,
      authorAvatar: user.avatar,
      content: commentText.trim(),
      timestamp: Date.now(),
    };
    await set(commentRef, newComment);
    setComments((prev) => [...prev, { id: commentRef.key!, ...newComment }]);
    await set(ref(db, `posts/${post.id}/commentsCount`), increment(1));
    setCommentText('');
  };

  const handleLike = async () => {
    if (!user) return;
    const newLiked = !liked;
    setLiked(newLiked);
    
    // Optimistic UI
    setLikesCount((prev) => prev + (newLiked ? 1 : -1));
    
    const userLikeRef = ref(db, `likes/${post.id}/${user.uid}`);
    if (newLiked) {
      await set(userLikeRef, true);
      await set(ref(db, `posts/${post.id}/likesCount`), increment(1));
    } else {
      await set(userLikeRef, null);
      await set(ref(db, `posts/${post.id}/likesCount`), increment(-1));
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + '/post/' + post.id);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Seguro que quieres eliminar este post?')) {
      if (!onDelete) return;
      await set(ref(db, `posts/${post.id}`), null);
      onDelete(post.id);
    }
  };

  const openImageModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    loadComments();
    setImgModalOpen(true);
    document.body.style.overflow = 'hidden';
    // Update URL without refreshing the page
    if (window.location.pathname !== `/post/${post.id}`) {
      window.history.pushState({ modalOpen: true }, '', `/post/${post.id}`);
    }
  };

  const closeImageModal = () => {
    setImgModalOpen(false);
    document.body.style.overflow = 'auto';
    // Revert URL if we pushed state
    if (window.history.state?.modalOpen) {
      window.history.back();
    }
  };

  const renderCommentsList = () => (
    <div className="mt-3 space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2">
          <span className="text-xl leading-none flex-shrink-0">{c.authorAvatar}</span>
          <div className="flex-1 rounded-2xl bg-white/[0.04] px-3 py-2">
            <span className="text-xs font-bold text-white mr-2">{c.authorName}</span>
            <p className="text-sm text-gray-200 mt-0.5">{c.content}</p>
          </div>
        </div>
      ))}
      {user ? (
        <div className="flex gap-2 items-center pt-2">
          <span className="text-xl flex-shrink-0">{user.avatar}</span>
          <div className="flex flex-1 gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendComment()}
              placeholder="Escribe un comentario..."
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-neon-pink/40 transition-all"
            />
            <button
              onClick={sendComment}
              disabled={!commentText.trim()}
              className="rounded-full bg-neon-pink/20 p-2 text-neon-pink hover:bg-neon-pink/30 disabled:opacity-30 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-xs text-gray-500 pt-2">Inicia sesión para interactuar</p>
      )}
    </div>
  );

  return (
    <>
      <article className="group relative rounded-2xl border border-white/5 bg-white/[0.025] p-4 sm:p-5 transition-all hover:border-white/10 hover:bg-white/[0.04]">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between">
          <Link
            to={`/perfil/${post.authorId}`}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl sm:text-3xl leading-none">{post.authorAvatar}</span>
            <div>
              <p className="text-sm font-bold text-white leading-tight hover:underline">{post.authorName}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <Link to={`/post/${post.id}`} className="hover:underline">{timeAgo(post.timestamp)}</Link>
                <span>·</span>
                {post.visibility === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] sm:text-xs font-semibold ${cat.color} bg-white/5 px-2 py-1 rounded-full flex items-center gap-1`}>
              <span>{cat.icon}</span> <span className="hidden sm:inline">{cat.label}</span>
            </span>

            {showDeleteOption && user?.uid === post.authorId && (
              <button
                onClick={handleDelete}
                title="Eliminar post"
                className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Link */}
        <div 
          onClick={() => navigate(`/post/${post.id}`)}
          className="cursor-pointer"
        >
          <p className="mb-3 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Image */}
        {post.image && (
          <div 
            className="mb-3 -mx-4 sm:mx-0 sm:rounded-xl overflow-hidden cursor-pointer"
            onClick={openImageModal}
          >
            <img
              src={post.image}
              alt="Post attachment"
              className="w-full max-h-[400px] object-cover hover:opacity-95 transition-opacity"
              loading="lazy"
            />
          </div>
        )}

        {/* Full Date for Single View */}
        {isSingleView && (
          <div className="mb-3 text-[13px] text-gray-500 font-medium">
            {fullDate(post.timestamp)}
          </div>
        )}

        {/* X/Twitter Style Actions Row */}
        <div className="mt-2 flex items-center gap-6 text-gray-500">
          <button
            onClick={handleToggleComments}
            className="group flex items-center gap-1.5 text-xs font-medium hover:text-white transition-colors"
          >
            <div className="rounded-full p-1.5 group-hover:bg-white/10 transition-colors">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span>{commentsCount > 0 ? commentsCount : ''}</span>
          </button>

          <button
            onClick={handleLike}
            disabled={!user}
            className={`group flex items-center gap-1.5 text-xs font-medium transition-colors ${
              liked ? 'text-neon-pink' : 'hover:text-neon-pink'
            } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`rounded-full p-1.5 transition-colors ${liked ? 'bg-neon-pink/10' : 'group-hover:bg-neon-pink/10'}`}>
              <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current text-neon-pink' : ''}`} />
            </div>
            <span>{likesCount > 0 ? likesCount : ''}</span>
          </button>

          <button
            onClick={handleShare}
            className={`group flex items-center gap-1.5 text-xs font-medium transition-colors ml-auto ${
              shareCopied ? 'text-emerald-400' : 'hover:text-emerald-400'
            }`}
          >
            <div className={`rounded-full p-1.5 transition-colors ${
              shareCopied ? 'bg-emerald-400/10' : 'group-hover:bg-emerald-400/10'
            }`}>
              <Share2 className="h-4 w-4" />
            </div>
            {shareCopied && <span className="text-[10px] font-bold">¡Enlace copiado!</span>}
          </button>
        </div>

        {/* Inline Comments */}
        {commentsOpen && (
          <div className="mt-3 border-t border-white/5 pt-2">
            {renderCommentsList()}
          </div>
        )}
      </article>

      {/* Image Modal */}
      {imgModalOpen && post.image && (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-black/95 backdrop-blur-sm">
          <button 
            onClick={closeImageModal}
            className="absolute top-4 left-4 md:right-4 md:left-auto z-50 rounded-full bg-black/50 p-2 text-white hover:bg-white/20 transition-all"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex-1 flex items-center justify-center p-0 md:p-8 h-[50vh] md:h-full relative mt-14 md:mt-0">
            <img 
              src={post.image} 
              className="max-w-full max-h-full object-contain" 
              alt="Post attachment full" 
            />
          </div>
          
          <div className="w-full md:w-[400px] bg-[#0a0a0a] border-l border-white/10 flex flex-col h-[50vh] md:h-full">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{post.authorAvatar}</span>
                <div>
                  <p className="font-bold text-white text-sm">{post.authorName}</p>
                  <p className="text-xs text-gray-500">{timeAgo(post.timestamp)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-200">{post.content}</p>
              
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="h-4 w-4 text-neon-pink fill-neon-pink" />
                  {likesCount} me gusta
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-gray-300" />
                  {commentsCount} comentarios
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {renderCommentsList()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
