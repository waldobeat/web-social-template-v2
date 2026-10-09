import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthContext } from '../lib/AuthContext';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import type { Post } from '../types';
import { ArrowLeft, UserPlus, X } from 'lucide-react';

export default function SinglePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();
  const [post, setPost] = useState<Post | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const snap = await get(ref(db, `posts/${id}`));
      if (snap.exists()) {
        setPost({ id, ...snap.val() } as Post);
      }
      setLoadingPost(false);
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    // Show register prompt after 60 seconds if user is not logged in
    let timer: ReturnType<typeof setTimeout>;
    if (!loading && !user) {
      timer = setTimeout(() => {
        setShowRegisterModal(true);
      }, 60000); // 60 seconds
    }
    return () => clearTimeout(timer);
  }, [user, loading]);

  const handleDelete = () => {
    navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {user && <Navbar />}

      <main className={`mx-auto max-w-2xl p-4 ${!user ? 'pt-8' : ''}`}>
        <button
          onClick={() => navigate('/feed')}
          className="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        {loadingPost ? (
          <div className="flex justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-pink border-t-transparent" />
          </div>
        ) : post ? (
          <PostCard post={post} onDelete={handleDelete} showDeleteOption={true} isSingleView={true} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Este post no existe o fue eliminado.
          </div>
        )}
      </main>

      {/* Register Modal for Guests */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neon-pink/30 bg-[#0a0a0a] shadow-2xl shadow-neon-pink/10">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-neon-pink/10">
                <UserPlus className="h-8 w-8 text-neon-pink" />
              </div>
              <h2 className="mb-2 text-2xl font-black text-white tracking-wide uppercase">
                Únete a la conversación
              </h2>
              <p className="mb-6 text-sm text-gray-400 leading-relaxed">
                Regístrate gratis para darle me gusta, comentar y compartir tus propias experiencias financieras en Sheddit.
              </p>

              <button
                onClick={() => navigate('/')}
                className="w-full rounded-xl bg-neon-pink py-3 font-bold text-white shadow-lg shadow-neon-pink/20 transition-all hover:bg-neon-pink/90 active:scale-95"
              >
                Crear cuenta gratis
              </button>
              
              <button
                onClick={() => setShowRegisterModal(false)}
                className="mt-4 text-xs font-semibold text-gray-500 hover:text-gray-300"
              >
                Seguir leyendo como invitado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
