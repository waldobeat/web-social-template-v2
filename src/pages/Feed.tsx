import { useState, useEffect } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import Navbar from '../components/Navbar';
import PostCard, { CATEGORIES } from '../components/PostCard';
import type { Post } from '../types';
import CreatePost from '../components/CreatePost';
import { TrendingUp, Hash, Flame, Sparkles } from 'lucide-react';

export default function Feed() {
  const { user } = useAuthContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | string>('all');
  const [tab, setTab] = useState<'recientes' | 'trending'>('recientes');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const postsRef = ref(db, 'posts');
    const unsub = onValue(postsRef, async (snap) => {
      const data = snap.val();
      if (!data) { setPosts([]); setLoading(false); return; }

      let following: Record<string, boolean> = {};
      if (user) {
        const followingSnap = await get(ref(db, `following/${user.uid}`));
        if (followingSnap.exists()) {
          following = followingSnap.val();
        }
      }

      const allPosts: Post[] = await Promise.all(
        Object.entries(data).map(async ([id, val]: [string, any]) => {
          // Check if current user liked this post
          let likedByMe = false;
          if (user) {
            const likeSnap = await get(ref(db, `likes/${id}/${user.uid}`));
            likedByMe = likeSnap.exists();
          }
          return {
            id,
            ...val,
            timestamp: typeof val.timestamp === 'number' ? val.timestamp : Date.now(),
            likedByMe,
          };
        })
      );

      // Filter: only public posts OR posts from followed users OR own posts
      const visible = allPosts.filter((p) => {
        if (p.authorId === user?.uid) return true;
        if (p.visibility === 'public') return true;
        if (p.visibility === 'followers' && following[p.authorId]) return true;
        return false;
      });

      visible.sort((a, b) =>
        tab === 'trending'
          ? (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount)
          : b.timestamp - a.timestamp
      );

      setPosts(visible);
      setLoading(false);
    });
    return () => unsub();
  }, [tab, user, refresh]);

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

          {/* Main column */}
          <div className="space-y-4">
            {/* Create post */}
            {user && (
              <CreatePost onCreated={() => setRefresh((r) => r + 1)} />
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-white/5 pb-1">
              <button
                onClick={() => setTab('recientes')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  tab === 'recientes' ? 'text-white bg-white/8' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Recientes
              </button>
              <button
                onClick={() => setTab('trending')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  tab === 'trending' ? 'text-white bg-white/8' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Trending
              </button>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-36 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="mb-3 text-5xl">📭</div>
                <h3 className="text-lg font-bold text-white mb-1">Nada por aquí aún</h3>
                <p className="text-sm text-gray-500">Sé el primero en publicar algo sobre finanzas.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            {/* User card */}
            {user && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl leading-none">{user.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{user.displayName}</p>
                    <p className="text-[11px] text-gray-500 truncate">@{user.username}</p>
                  </div>
                </div>
                {user.bio && <p className="text-xs text-gray-400 mb-3 leading-relaxed">{user.bio}</p>}
                <div className="flex gap-4 text-center border-t border-white/5 pt-3">
                  <div>
                    <p className="text-sm font-black text-white">{user.postsCount}</p>
                    <p className="text-[10px] text-gray-600">Posts</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{user.followersCount}</p>
                    <p className="text-[10px] text-gray-600">Seguidores</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{user.followingCount}</p>
                    <p className="text-[10px] text-gray-600">Siguiendo</p>
                  </div>
                </div>
              </div>
            )}

            {/* Category filter */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="h-3.5 w-3.5 text-gray-500" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categorías</p>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    filter === 'all' ? 'bg-white/8 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/4'
                  }`}
                >
                  <span>🌐</span> Todos
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      filter === cat.id ? `bg-white/8 ${cat.color}` : 'text-gray-500 hover:text-gray-300 hover:bg-white/4'
                    }`}
                  >
                    <span>{cat.icon}</span> {cat.label}
                    <span className="ml-auto text-[10px] text-gray-600">
                      {posts.filter((p) => p.category === cat.id).length || ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending topics */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Destacado</p>
              </div>
              <div className="space-y-2">
                {['Cashea', 'Krece', 'Credix', 'Préstamos sin interés', 'Finanzas Venezuela'].map((t) => (
                  <div key={t} className="flex items-center gap-2 py-1">
                    <span className="text-neon-pink text-xs font-bold">#</span>
                    <span className="text-xs text-gray-400 hover:text-white cursor-pointer transition-colors">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
