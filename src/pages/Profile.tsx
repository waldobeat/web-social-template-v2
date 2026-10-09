import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, set, onValue, increment } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import type { Post } from '../types';
import { UserPlus, UserMinus, Calendar, MessageSquare } from 'lucide-react';

interface ProfileUser {
  uid: string;
  displayName: string;
  username: string;
  bio: string;
  avatar: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: number;
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthContext();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const isOwn = currentUser?.uid === userId;

  useEffect(() => {
    if (!userId) return;



    // Load profile from Firebase
    const userRef = ref(db, `users/${userId}`);
    get(userRef).then((snap) => {
      if (snap.exists()) {
        setProfileUser({ uid: userId, ...snap.val() });
      }
    });

    // Check if current user follows this profile
    if (currentUser) {
      get(ref(db, `following/${currentUser.uid}/${userId}`)).then((snap) => {
        setIsFollowing(snap.exists());
      });
    }

    // Load user posts
    const postsRef = ref(db, 'posts');
    const unsub = onValue(postsRef, (snap) => {
      const data = snap.val();
      if (!data) { setPosts([]); setLoading(false); return; }
      const userPosts: Post[] = Object.entries(data)
        .filter(([, val]: [string, any]) => val.authorId === userId)
        .filter(([, val]: [string, any]) => {
          if (isOwn) return true;
          if (val.visibility === 'public') return true;
          return isFollowing && val.visibility === 'followers';
        })
        .map(([id, val]: [string, any]) => ({
          id,
          ...val,
          timestamp: typeof val.timestamp === 'number' ? val.timestamp : Date.now(),
        }));
      userPosts.sort((a, b) => b.timestamp - a.timestamp);
      setPosts(userPosts);
      setLoading(false);
    });
    return () => unsub();
  }, [userId, currentUser, isOwn, isFollowing]);

  const handleFollow = async () => {
    if (!currentUser || !userId || followLoading) return;
    setFollowLoading(true);
    const newFollowing = !isFollowing;
    setIsFollowing(newFollowing);
    setProfileUser((prev) => prev ? {
      ...prev,
      followersCount: prev.followersCount + (newFollowing ? 1 : -1),
    } : prev);

    // Update Firebase
    const followRef = ref(db, `following/${currentUser.uid}/${userId}`);
    const followerRef = ref(db, `followers/${userId}/${currentUser.uid}`);
    if (newFollowing) {
      await set(followRef, true);
      await set(followerRef, true);
      await set(ref(db, `users/${userId}/followersCount`), increment(1));
      await set(ref(db, `users/${currentUser.uid}/followingCount`), increment(1));
    } else {
      await set(followRef, null);
      await set(followerRef, null);
      await set(ref(db, `users/${userId}/followersCount`), increment(-1));
      await set(ref(db, `users/${currentUser.uid}/followingCount`), increment(-1));
    }
    setFollowLoading(false);
  };

  if (!profileUser && !loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-gray-200 flex items-center justify-center">
        <Navbar />
        <p className="text-gray-500">Usuario no encontrado.</p>
      </div>
    );
  }

  const joinDate = profileUser?.createdAt
    ? new Date(profileUser.createdAt).toLocaleDateString('es-VE', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      <Navbar />

      {/* Banner */}
      <div className="relative h-40 bg-gradient-to-br from-neon-pink/20 via-purple-900/20 to-[#050505] border-b border-white/5" />

      <div className="mx-auto max-w-3xl px-4">
        {/* Profile card */}
        <div className="relative -mt-16 mb-6">
          <div className="rounded-2xl border border-white/8 bg-[#0a0a0a] p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              {/* Avatar & basic info */}
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-[#0a0a0a] bg-gradient-to-br from-neon-pink/20 to-purple-900/30 text-4xl shadow-xl">
                  {profileUser?.avatar || '👤'}
                </div>
                <div>
                  <h1 className="text-xl font-black text-white">{profileUser?.displayName}</h1>
                  <p className="text-sm text-gray-500">@{profileUser?.username}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-shrink-0">
                {isOwn ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all"
                  >
                    Editar perfil
                  </button>
                ) : (
                  <>
                    <button className="rounded-xl border border-white/15 bg-white/5 p-2 text-gray-400 hover:text-white transition-all">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleFollow}
                      disabled={followLoading || !currentUser}
                      className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition-all ${
                        isFollowing
                          ? 'border border-white/15 bg-white/5 text-white hover:border-red-500/30 hover:text-red-400'
                          : 'bg-neon-pink text-white shadow-lg shadow-neon-pink/20 hover:opacity-90'
                      } disabled:opacity-40`}
                    >
                      {isFollowing ? (
                        <><UserMinus className="h-3.5 w-3.5" /> Siguiendo</>
                      ) : (
                        <><UserPlus className="h-3.5 w-3.5" /> Seguir</>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            {profileUser?.bio && (
              <p className="mt-4 text-sm text-gray-300 leading-relaxed">{profileUser.bio}</p>
            )}

            {/* Meta info */}
            <div className="mt-4 flex items-center flex-wrap gap-4 text-xs text-gray-500">
              {joinDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Se unió en {joinDate}
                </span>
              )}

            </div>

            {/* Stats */}
            <div className="mt-4 flex gap-6 border-t border-white/5 pt-4">
              <div>
                <span className="font-black text-white">{profileUser?.postsCount || posts.length}</span>
                <span className="ml-1 text-xs text-gray-500">Posts</span>
              </div>
              <div>
                <span className="font-black text-white">{profileUser?.followersCount || 0}</span>
                <span className="ml-1 text-xs text-gray-500">Seguidores</span>
              </div>
              <div>
                <span className="font-black text-white">{profileUser?.followingCount || 0}</span>
                <span className="ml-1 text-xs text-gray-500">Siguiendo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts section */}
        <h2 className="mb-4 text-sm font-bold text-gray-400 uppercase tracking-wider">
          {isOwn ? 'Mis publicaciones' : `Posts de ${profileUser?.displayName}`}
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-3 text-4xl">📝</div>
            <p className="text-gray-500 text-sm">
              {isOwn ? 'Aún no has publicado nada.' : 'Este usuario no tiene posts públicos.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-10">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                showDeleteOption={isOwn}
                onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
