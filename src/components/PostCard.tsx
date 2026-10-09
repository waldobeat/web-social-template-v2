import { useState, useEffect } from 'react';
import { ref, push, set, get, increment, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Share2, Globe, Lock, MoreHorizontal, Send, Trash2, X } from 'lucide-react';
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

function getCat(id: string) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
  showDeleteOption?: boolean;
}

export default function PostCard({ post, onDelete, showDeleteOption = false }: PostCardProps) {
  const { user } = useAuthContext();
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Comments state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loaded, setLoaded] = useState(false);
  
  // Image modal state
  const [imgModalOpen, setImgModalOpen] = useState(false);

  const cat = getCat(post.category);

  // Listen for likes changes in real-time (optional, but good for UI)
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
      alert('¡Enlace copiado al portapapeles!');
    } catch {
      // ignore
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    await set(ref(db, `posts/${post.id}`), null);
    onDelete(post.id);
    setMenuOpen(false);
  };

  const openImageModal = () => {
    loadComments();
    setImgModalOpen(true);
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setImgModalOpen(false);
    document.body.style.overflow = 'auto';
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
        <p className="text-center text-xs text-gray-500 pt-2">Inicia sesión para comentar</p>
      )}
    </div>
  );

  return (
    <>
      <article className="group relative rounded-2xl border border-white/5 bg-white/[0.025] p-4 sm:p-5 transition-all hover:border-white/10 hover:bg-white/[0.04]">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <Link
            to={`/perfil/${post.authorId}`}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl sm:text-3xl leading-none">{post.authorAvatar}</span>
            <div>
              <p className="text-sm font-bold text-white leading-tight">{post.authorName}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span>{timeAgo(post.timestamp)}</span>
                <span>·</span>
                {post.visibility === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] sm:text-xs font-semibold ${cat.color} bg-white/5 px-2 py-1 rounded-full flex items-center gap-1`}>
              <span>{cat.icon}</span> <span className="hidden sm:inline">{cat.label}</span>
            </span>

            {showDeleteOption && user?.uid === post.authorId && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="rounded-lg p-1.5 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-white/10 bg-[#111] shadow-2xl z-10">
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="mb-3 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

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

        {/* Stats Row (Facebook style) */}
        <div className="flex items-center justify-between text-gray-400 text-xs py-2 px-1">
          <div className="flex items-center gap-1.5">
            {likesCount > 0 && (
              <>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neon-pink text-white">
                  <ThumbsUp className="h-3 w-3 fill-current" />
                </div>
                <span>{likesCount}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {commentsCount > 0 && (
              <button onClick={handleToggleComments} className="hover:underline">
                {commentsCount} comentarios
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 my-1" />

        {/* Action Buttons (Facebook style) */}
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={handleLike}
            disabled={!user}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              liked ? 'text-neon-pink' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ThumbsUp className={`h-4 w-4 sm:h-5 sm:w-5 ${liked ? 'fill-current' : ''}`} />
            Me gusta
          </button>

          <button
            onClick={handleToggleComments}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-semibold text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all"
          >
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            Comentar
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-semibold text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all"
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            Compartir
          </button>
        </div>

        {/* Inline Comments */}
        {commentsOpen && (
          <div className="mt-2 border-t border-white/5 pt-2">
            {renderCommentsList()}
          </div>
        )}
      </article>

      {/* Image Modal (Facebook style) */}
      {imgModalOpen && post.image && (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-black/95 backdrop-blur-sm">
          {/* Close button (Mobile: top right, Desktop: top left) */}
          <button 
            onClick={closeImageModal}
            className="absolute top-4 left-4 md:right-4 md:left-auto z-50 rounded-full bg-black/50 p-2 text-white hover:bg-white/20 transition-all"
          >
            <X className="h-6 w-6" />
          </button>
          
          {/* Left side: Image Viewer */}
          <div className="flex-1 flex items-center justify-center p-0 md:p-8 h-[50vh] md:h-full relative mt-14 md:mt-0">
            <img 
              src={post.image} 
              className="max-w-full max-h-full object-contain" 
              alt="Post attachment full" 
            />
          </div>
          
          {/* Right side: Post details & Comments */}
          <div className="w-full md:w-[400px] bg-[#0a0a0a] border-l border-white/10 flex flex-col h-[50vh] md:h-full">
            {/* Header info */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{post.authorAvatar}</span>
                <div>
                  <p className="font-bold text-white text-sm">{post.authorName}</p>
                  <p className="text-xs text-gray-500">{timeAgo(post.timestamp)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-200">{post.content}</p>
              
              <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="h-3.5 w-3.5 text-neon-pink fill-neon-pink" />
                  {likesCount}
                </span>
                <span>{commentsCount} comentarios</span>
              </div>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderCommentsList()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
