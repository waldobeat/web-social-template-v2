import { useState, useEffect, useRef } from 'react';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import Navbar from '../components/Navbar';
import { Send, MessageSquare, ThumbsUp, TrendingUp, Clock, Hash, ChevronDown, Flame } from 'lucide-react';


interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  category: string;
  timestamp: number;
  likes: number;
  likedBy?: Record<string, boolean>;
  replies?: Record<string, Reply>;
  replyCount?: number;
}

interface Reply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: number;
}

const CATEGORIES = [
  { id: 'general', label: 'General', icon: '💬', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  { id: 'cashea', label: 'Cashea', icon: '🛍️', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { id: 'krece', label: 'Krece', icon: '📱', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'credix', label: 'Credix', icon: '🏦', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'consejos', label: 'Consejos', icon: '💡', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  { id: 'experiencias', label: 'Experiencias', icon: '⭐', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
];

const AVATARS = ['🦁', '🐯', '🦊', '🐺', '🦅', '🐬', '🦋', '🌵', '🔥', '⚡'];

function getCategoryData(categoryId: string) {
  return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
}

function timeAgo(timestamp: number): string {
  if (!timestamp) return 'ahora';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${days}d`;
}

function ReplySection({ postId, replyCount }: { postId: string; replyCount: number }) {
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [text, setText] = useState('');
  const { user } = useAuthContext();

  useEffect(() => {
    if (!open) return;
    const repliesRef = ref(db, `forum_posts/${postId}/replies`);
    const unsub = onValue(repliesRef, (snap) => {
      const data = snap.val();
      if (!data) return setReplies([]);
      const list = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
      list.sort((a, b) => a.timestamp - b.timestamp);
      setReplies(list);
    });
    return () => unsub();
  }, [open, postId]);

  const sendReply = async () => {
    if (!text.trim() || !user) return;
    const repliesRef = ref(db, `forum_posts/${postId}/replies`);
    await push(repliesRef, {
      author: user.displayName,
      avatar: user.avatar,
      content: text.trim(),
      timestamp: serverTimestamp(),
    });
    setText('');
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        {replyCount > 0 ? `${replyCount} respuesta${replyCount !== 1 ? 's' : ''}` : 'Responder'}
        {replyCount > 0 && <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && (
        <div className="mt-3 space-y-3 pl-3 border-l border-white/10">
          {replies.map((r) => (
            <div key={r.id} className="flex gap-2">
              <span className="text-base leading-none mt-0.5">{r.avatar}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-gray-300">{r.author}</span>
                  <span className="text-xs text-gray-600">{timeAgo(r.timestamp)}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{r.content}</p>
              </div>
            </div>
          ))}
          {!user?.isGuest ? (
            <div className="flex gap-2 pt-1">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                placeholder="Escribe una respuesta..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
              <button
                onClick={sendReply}
                disabled={!text.trim()}
                className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-400 transition-all hover:bg-emerald-500/30 disabled:opacity-40"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="pt-2 text-[11px] text-gray-500">
              Regístrate para poder responder.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const cat = getCategoryData(post.category);
  const replyCount = post.replies ? Object.keys(post.replies).length : (post.replyCount || 0);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikesCount((p) => p + 1);
    const postRef = ref(db, `forum_posts/${post.id}/likes`);
    // Simple optimistic update; in production use transactions
    await push(postRef, true);
  };

  return (
    <div className="group rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-white/10 hover:bg-white/[0.05]">
      {/* Author row */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl leading-none">{post.avatar}</span>
          <div>
            <span className="text-sm font-bold text-white">{post.author}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="h-3 w-3 text-gray-600" />
              <span className="text-xs text-gray-600">{timeAgo(post.timestamp)}</span>
            </div>
          </div>
        </div>
        <span className={`flex items-center gap-1 rounded-full border ${cat.border} ${cat.bg} px-2.5 py-0.5 text-xs font-semibold ${cat.color}`}>
          <span>{cat.icon}</span>
          {cat.label}
        </span>
      </div>

      {/* Content */}
      <p className="mb-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs transition-all ${
            liked ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'
          }`}
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>
        <ReplySection postId={post.id} replyCount={replyCount} />
      </div>
    </div>
  );
}

export default function Foro() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'reciente' | 'popular'>('reciente');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const postsRef = ref(db, 'forum_posts');
    const unsub = onValue(postsRef, (snap) => {
      const data = snap.val();
      if (!data) {
        setPosts([]);
        setLoading(false);
        return;
      }
      const list: Post[] = Object.entries(data).map(([id, val]: [string, any]) => ({
        id,
        ...val,
        likes: val.likes ? Object.keys(val.likes).length : 0,
      }));
      list.sort((a, b) =>
        sortBy === 'reciente' ? b.timestamp - a.timestamp : b.likes - a.likes
      );
      setPosts(list);
      setLoading(false);
    });
    return () => unsub();
  }, [sortBy]);

  const handleSubmit = async () => {
    if (!newPost.trim() || submitting || !user) return;
    setSubmitting(true);
    const postsRef = ref(db, 'forum_posts');
    await push(postsRef, {
      author: user.displayName,
      avatar: user.avatar,
      content: newPost.trim(),
      category: selectedCategory,
      timestamp: serverTimestamp(),
      likes: 0,
    });
    setNewPost('');
    setSubmitting(false);
    textareaRef.current?.focus();
  };

  const filtered = filterCategory === 'all' ? posts : posts.filter((p) => p.category === filterCategory);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Comunidad abierta</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Foro</h1>
          <p className="text-gray-500 text-sm">Habla sin tabú sobre préstamos, finanzas y tu experiencia real en Venezuela.</p>
        </div>

        {/* New Post */}
        {user && !user.isGuest && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="mb-3 text-sm font-bold text-white">¿Qué quieres compartir?</p>

            {/* Category selector */}
            <div className="mb-3 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? `${cat.bg} ${cat.border} ${cat.color}`
                      : 'border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
              }}
              placeholder="Comparte tu experiencia, pregunta o consejo... (Ctrl+Enter para publicar)"
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none transition-all"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-600">{newPost.length}/1000 caracteres</span>
              <button
                onClick={handleSubmit}
                disabled={!newPost.trim() || submitting || newPost.length > 1000}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-3.5 w-3.5" />
                {submitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory('all')}
              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                filterCategory === 'all'
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-white/5 text-gray-500 hover:text-gray-300'
              }`}
            >
              <Hash className="h-3 w-3" />
              Todos
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                  filterCategory === cat.id
                    ? `${cat.bg} ${cat.border} ${cat.color}`
                    : 'border-white/5 text-gray-500 hover:text-gray-300'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setSortBy('reciente')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                sortBy === 'reciente' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Clock className="h-3 w-3" />
              Recientes
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                sortBy === 'popular' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <TrendingUp className="h-3 w-3" />
              Populares
            </button>
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl border border-white/5 bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 text-5xl">💬</div>
            <h3 className="text-lg font-bold text-white mb-1">Sé el primero en publicar</h3>
            <p className="text-sm text-gray-500">Aún no hay publicaciones en esta categoría. ¡Inicia la conversación!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
