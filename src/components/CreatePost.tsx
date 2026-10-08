import { useState } from 'react';
import { ref, push, set, serverTimestamp, increment } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import { CATEGORIES } from './PostCard';
import { Send, Globe, Lock, ChevronDown } from 'lucide-react';

interface CreatePostProps {
  onCreated?: () => void;
  defaultCategory?: string;
}

export default function CreatePost({ onCreated, defaultCategory = 'general' }: CreatePostProps) {
  const { user } = useAuthContext();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
  const [submitting, setSubmitting] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  if (!user) return null;

  const selectedCat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const postsRef = ref(db, 'posts');
      const newPost = {
        authorId: user.uid,
        authorName: user.displayName,
        authorAvatar: user.avatar,
        authorUsername: user.username,
        content: content.trim(),
        category,
        visibility,
        timestamp: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
      };
      const postRef = await push(postsRef, newPost);

      // Also index under user's posts
      await set(ref(db, `userPosts/${user.uid}/${postRef.key}`), {
        timestamp: serverTimestamp(),
        visibility,
      });

      // Increment user post count
      if (!user.isGuest) {
        await set(ref(db, `users/${user.uid}/postsCount`), increment(1));
      }

      setContent('');
      setCategory('general');
      setVisibility('public');
      onCreated?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
      {/* Author row */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-2xl leading-none flex-shrink-0">{user.avatar}</span>
        <div>
          <p className="text-sm font-bold text-white">{user.displayName}</p>
          <p className="text-[11px] text-gray-500">@{user.username}</p>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
        placeholder="¿Qué quieres compartir sobre préstamos o finanzas?"
        rows={3}
        maxLength={2000}
        className="w-full resize-none rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink/40 focus:bg-white/6 transition-all"
      />

      {/* Options row */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {/* Category picker */}
        <div className="relative">
          <button
            onClick={() => setCatOpen(!catOpen)}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:border-white/20 hover:text-white transition-all"
          >
            <span>{selectedCat.icon}</span>
            <span>{selectedCat.label}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {catOpen && (
            <div className="absolute left-0 top-full mt-1 w-44 rounded-xl border border-white/10 bg-[#111] shadow-2xl z-20">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setCategory(cat.id); setCatOpen(false); }}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all hover:bg-white/5 ${
                    category === cat.id ? cat.color : 'text-gray-400'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Visibility toggle */}
        <button
          onClick={() => setVisibility(visibility === 'public' ? 'followers' : 'public')}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
            visibility === 'public'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-purple-500/30 bg-purple-500/10 text-purple-400'
          }`}
        >
          {visibility === 'public'
            ? <><Globe className="h-3 w-3" /> Público</>
            : <><Lock className="h-3 w-3" /> Solo seguidores</>
          }
        </button>

        {/* Character count + submit */}
        <div className="ml-auto flex items-center gap-3">
          <span className={`text-[11px] ${content.length > 1800 ? 'text-amber-400' : 'text-gray-600'}`}>
            {content.length}/2000
          </span>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="flex items-center gap-2 rounded-xl bg-neon-pink px-4 py-2 text-xs font-bold text-white shadow-lg shadow-neon-pink/20 transition-all hover:shadow-neon-pink/40 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}
