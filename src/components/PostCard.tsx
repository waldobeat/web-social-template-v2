import { useState } from 'react';
import { ref, push, set, get, increment } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Share2, Globe, Lock, MoreHorizontal, ChevronDown, Send, Trash2 } from 'lucide-react';
import type { Post, Comment } from '../types';

// Re-export Post type so other files can import it from here
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

function CommentsSection({ postId }: { postId: string }) {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);

  const loadComments = async () => {
    if (loaded) { setOpen(!open); return; }
    const snap = await get(ref(db, `comments/${postId}`));
    const data = snap.val();
    if (data) {
      const list = Object.entries(data).map(([id, v]: [string, any]) => ({ id, ...v }));
      list.sort((a: any, b: any) => a.timestamp - b.timestamp);
      setComments(list as Comment[]);
    }
    setLoaded(true);
    setOpen(true);
  };

  const sendComment = async () => {
    if (!text.trim() || !user) return;
    const commentRef = push(ref(db, `comments/${postId}`));
    const newComment: Omit<Comment, 'id'> = {
      authorId: user.uid,
      authorName: user.displayName,
      authorAvatar: user.avatar,
      content: text.trim(),
      timestamp: Date.now(),
    };
    await set(commentRef, newComment);
    setComments((prev) => [...prev, { id: commentRef.key!, ...newComment }]);
    await set(ref(db, `posts/${postId}/commentsCount`), comments.length + 1);
    setText('');
  };

  return (
    <div>
      <button
        onClick={loadComments}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Comentar
        {open ? <ChevronDown className="h-3 w-3 rotate-180 transition-transform" /> : null}
      </button>

      {open && (
        <div className="mt-3 space-y-2.5 border-t border-white/5 pt-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <span className="text-lg leading-none mt-0.5 flex-shrink-0">{c.authorAvatar}</span>
              <div className="flex-1 rounded-xl bg-white/[0.04] px-3 py-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-white">{c.authorName}</span>
                  <span className="text-[10px] text-gray-600">{timeAgo(c.timestamp)}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
          {!user?.isGuest ? (
            <div className="flex gap-2 items-center pt-1">
              <span className="text-base flex-shrink-0">{user?.avatar}</span>
              <div className="flex flex-1 gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendComment()}
                  placeholder="Escribe un comentario..."
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-neon-pink/30 transition-all"
                />
                <button
                  onClick={sendComment}
                  disabled={!text.trim()}
                  className="rounded-full bg-neon-pink/20 p-2 text-neon-pink transition-all hover:bg-neon-pink/30 disabled:opacity-30"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 text-center text-[11px] text-gray-500">
              Regístrate para poder comentar.
            </div>
          )}
        </div>
      )}
    </div>
  );
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
  const [menuOpen, setMenuOpen] = useState(false);
  const cat = getCat(post.category);

  const handleLike = async () => {
    if (!user || user.isGuest) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((p) => p + (newLiked ? 1 : -1));
    await set(ref(db, `posts/${post.id}/likesCount`), increment(newLiked ? 1 : -1));
    const userLikeRef = ref(db, `likes/${post.id}/${user.uid}`);
    if (newLiked) {
      await set(userLikeRef, true);
    } else {
      await set(userLikeRef, null);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + '/post/' + post.id);
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

  return (
    <article className="group relative rounded-2xl border border-white/5 bg-white/[0.025] p-5 transition-all hover:border-white/10 hover:bg-white/[0.04]">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <Link
          to={`/perfil/${post.authorId}`}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl leading-none">{post.authorAvatar}</span>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{post.authorName}</p>
            <p className="text-[11px] text-gray-500">@{post.authorUsername} · {timeAgo(post.timestamp)}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-gray-600">
            {post.visibility === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          </span>
          <span className={`text-xs font-semibold ${cat.color}`}>{cat.icon} {cat.label}</span>

          {showDeleteOption && user?.uid === post.authorId && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg p-1 text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
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
      <p className="mb-4 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

      <div className="mb-3 border-t border-white/5" />

      {/* Actions */}
      <div className="flex items-center gap-5">
        <button
          onClick={handleLike}
          disabled={user?.isGuest}
          className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
            liked ? 'text-neon-pink' : 'text-gray-500 hover:text-neon-pink'
          } ${user?.isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
          <span>{likesCount > 0 ? likesCount : ''} {liked ? 'Te gusta' : 'Me gusta'}</span>
        </button>

        <CommentsSection postId={post.id} />

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-white transition-colors ml-auto"
        >
          <Share2 className="h-3.5 w-3.5" />
          Compartir
        </button>
      </div>
    </article>
  );
}
