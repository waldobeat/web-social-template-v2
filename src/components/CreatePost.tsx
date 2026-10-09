import { useState, useRef } from 'react';
import { ref, push, set, serverTimestamp, increment } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import { CATEGORIES } from './PostCard';
import { Send, Globe, Lock, ChevronDown, ImagePlus, X, Loader2 } from 'lucide-react';

interface CreatePostProps {
  onCreated?: () => void;
  defaultCategory?: string;
}

// Compress image with canvas to max width and quality, returns base64 data URL
function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function CreatePost({ onCreated, defaultCategory = 'general' }: CreatePostProps) {
  const { user } = useAuthContext();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
  const [submitting, setSubmitting] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const selectedCat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no puede superar 10 MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;
    if (submitting) return;
    setSubmitting(true);

    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        setUploadingImage(true);
        // Compress with canvas → store base64 directly in Firebase (no external service)
        imageUrl = await compressImage(imageFile, 1200, 0.8);
        setUploadingImage(false);
      }

      const postsRef = ref(db, 'posts');
      const newPost: Record<string, any> = {
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
      if (imageUrl) newPost.image = imageUrl;

      const postRef = await push(postsRef, newPost);

      await set(ref(db, `userPosts/${user.uid}/${postRef.key}`), {
        timestamp: serverTimestamp(),
        visibility,
      });

      if (user) {
        await set(ref(db, `users/${user.uid}/postsCount`), increment(1));
      }

      setContent('');
      setCategory('general');
      setVisibility('public');
      removeImage();
      onCreated?.();
    } catch (err: any) {
      alert(err.message || 'Error al publicar');
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
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
        onChange={(e) => {
          setContent(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
        onPaste={(e) => {
          const items = e.clipboardData.items;
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              const file = items[i].getAsFile();
              if (file) {
                if (file.size > 10 * 1024 * 1024) {
                  alert('La imagen no puede superar 10 MB.');
                  return;
                }
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
                // Do not prevent default so text can still be pasted if it's mixed
              }
            }
          }
        }}
        placeholder="¿Qué quieres compartir sobre préstamos o finanzas? (También puedes pegar una imagen aquí)"
        rows={3}
        maxLength={2000}
        className="w-full resize-none rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-neon-pink/40 focus:bg-white/6 transition-colors overflow-hidden"
      />

      {/* Image preview */}
      {imagePreview && (
        <div className="relative mt-3 rounded-xl overflow-hidden border border-white/10">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-72 w-full object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-all"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

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

        {/* Image upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={submitting}
          title="Agregar imagen (máx 10MB)"
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:border-neon-pink/30 hover:text-neon-pink transition-all disabled:opacity-40"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          Imagen
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        {/* Character count + submit */}
        <div className="ml-auto flex items-center gap-3">
          <span className={`text-[11px] ${content.length > 1800 ? 'text-amber-400' : 'text-gray-600'}`}>
            {content.length}/2000
          </span>
          <button
            onClick={handleSubmit}
            disabled={(!content.trim() && !imageFile) || submitting}
            className="flex items-center gap-2 rounded-xl bg-neon-pink px-4 py-2 text-xs font-bold text-white shadow-lg shadow-neon-pink/20 transition-all hover:shadow-neon-pink/40 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {uploadingImage ? 'Procesando...' : 'Publicando...'}
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Publicar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
