import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import type { Post } from '../types';
import {
  Edit3, Save, X,
  Globe, Lock, PenSquare, Users
} from 'lucide-react';

const AVATARS = ['🦁', '🐯', '🦊', '🐺', '🦅', '🐬', '🦋', '🌵', '🔥', '⚡', '🎭', '🧠', '🌊', '🦄', '🐉', '⚔️', '🎯', '🚀', '💎', '🌙'];

type DashTab = 'posts' | 'settings';

export default function Dashboard() {
  const { user, updateProfile, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [tab, setTab] = useState<DashTab>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh] = useState(0);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/'); return; }
    setEditName(user.displayName);
    setEditBio(user.bio || '');
    setEditUsername(user.username);
    setEditAvatar(user.avatar);
    setEditEmail(user.email || '');
    setEditBirthDate(user.birthDate || '');
  }, [user, navigate, authLoading]);

  // Load user's posts
  useEffect(() => {
    if (!user) return;
    const postsRef = ref(db, 'posts');
    const unsub = onValue(postsRef, (snap) => {
      const data = snap.val();
      if (!data) { setPosts([]); setLoading(false); return; }
      const myPosts: Post[] = Object.entries(data)
        .filter(([, val]: [string, any]) => val.authorId === user.uid)
        .map(([id, val]: [string, any]) => ({
          id,
          ...val,
          timestamp: typeof val.timestamp === 'number' ? val.timestamp : Date.now(),
        }));
      myPosts.sort((a, b) => b.timestamp - a.timestamp);
      setPosts(myPosts);
      setLoading(false);
    });
    return () => unsub();
  }, [user, refresh]);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;

    if (editBirthDate) {
      const birth = new Date(editBirthDate);
      const ageDiff = Date.now() - birth.getTime();
      const ageDate = new Date(ageDiff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age < 18) {
        alert("Debes ser mayor de 18 años.");
        return;
      }
    }

    setSaving(true);
    await updateProfile({
      displayName: editName.trim(),
      bio: editBio.trim(),
      username: editUsername.trim() || user?.username,
      avatar: editAvatar,
      email: editEmail.trim(),
      birthDate: editBirthDate,
    });
    setSaving(false);
    setEditing(false);
  };

  const handleDeletePost = async (id: string) => {
    await set(ref(db, `posts/${id}`), null);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  if (!user) return null;

  const publicPosts = posts.filter((p) => p.visibility === 'public');
  const privatePosts = posts.filter((p) => p.visibility === 'followers');

  const tabs: { id: DashTab; label: string; icon: React.FC<any> }[] = [
    { id: 'posts', label: 'Mis Posts', icon: PenSquare },
    { id: 'settings', label: 'Mi Perfil', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <span className="text-4xl">{user.avatar}</span>
          <div>
            <h1 className="text-2xl font-black text-white">Mi Panel</h1>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-white/5 pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                tab === id
                  ? 'bg-neon-pink/15 text-neon-pink'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* === MIS POSTS === */}
        {tab === 'posts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Mis publicaciones ({posts.length})
              </h2>
              {posts.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3 text-emerald-400" />
                    {publicPosts.length} públicos
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-violet-400" />
                    {privatePosts.length} privados
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-3 text-4xl">📝</div>
                <p className="text-gray-500 text-sm">Aún no has publicado nada.</p>
                <Link
                  to="/feed"
                  className="mt-4 rounded-xl bg-neon-pink px-5 py-2 text-xs font-bold text-white hover:bg-neon-pink/80 transition-all"
                >
                  Ir al Feed a publicar
                </Link>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  showDeleteOption
                  onDelete={handleDeletePost}
                />
              ))
            )}
          </div>
        )}

        {/* === MI PERFIL === */}
        {tab === 'settings' && (
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Mi Perfil</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-400 hover:text-white transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-neon-pink px-4 py-2 text-xs font-bold text-white shadow-lg shadow-neon-pink/20 transition-all hover:opacity-90 disabled:opacity-40"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </div>

            {/* Avatar selector */}
            <div>
              <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider">Avatar</label>
              {editing ? (
                <div className="grid grid-cols-10 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      onClick={() => setEditAvatar(av)}
                      className={`text-2xl rounded-xl p-2 transition-all ${
                        editAvatar === av
                          ? 'bg-neon-pink/20 ring-2 ring-neon-pink/50'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{user.avatar}</span>
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</label>
              {editing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={40}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-neon-pink/40 transition-all"
                />
              ) : (
                <p className="text-sm text-white">{user.displayName}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider">@Usuario</label>
              {editing ? (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                  <input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                    maxLength={20}
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-4 py-3 text-sm text-white outline-none focus:border-neon-pink/40 transition-all"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-400">@{user.username}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider">Biografía</label>
              {editing ? (
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="Cuéntale a la comunidad quién eres..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink/40 transition-all"
                />
              ) : (
                <p className="text-sm text-gray-400">{user.bio || 'Sin biografía aún.'}</p>
              )}
            </div>

            {/* Private Fields */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Datos Privados</h3>
              </div>
              <p className="text-[11px] text-gray-500">Estos datos no serán visibles para otros usuarios.</p>

              <div>
                <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider">Correo</label>
                {editing ? (
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 transition-all"
                  />
                ) : (
                  <p className="text-sm text-gray-400">{user.email || 'No especificado'}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha de Nacimiento (+18)</label>
                {editing ? (
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 transition-all"
                  />
                ) : (
                  <p className="text-sm text-gray-400">{user.birthDate || 'No especificado'}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
