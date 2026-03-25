import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import './GifPicker.css';

// Giphy API - Using public beta key for development
const GIPHY_API_KEY = 'dc6zaTOxFJmzC'; // Public beta key
const GIPHY_TRENDING_URL = (offset = 0) =>
  `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=24&offset=${offset}&rating=g`;
const GIPHY_SEARCH_URL = (query: string, offset = 0) =>
  `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=24&offset=${offset}&rating=g`;

interface GifItem {
  id: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
    };
  };
}

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

// Fallback GIFs when API fails
const FALLBACK_GIFS: GifItem[] = [
  { id: '1', title: 'Happy', images: { fixed_height: { url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' } } },
  { id: '2', title: 'Love', images: { fixed_height: { url: 'https://media.giphy.com/media/3o7TKF1rD7hnbmAnf6/giphy.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/3o7TKF1rD7hnbmAnf6/giphy.gif' } } },
  { id: '3', title: 'Celebrate', images: { fixed_height: { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' } } },
  { id: '4', title: 'Wow', images: { fixed_height: { url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif' } } },
  { id: '5', title: 'Dance', images: { fixed_height: { url: 'https://media.giphy.com/media/l0MYGb1LuZ3n7dIxO/giphy.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/l0MYGb1LuZ3n7dIxO/giphy.gif' } } },
  { id: '6', title: 'Cute', images: { fixed_height: { url: 'https://media.giphy.com/media/xT5LMHxhOfsc9cQ2Z6/giphy.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/xT5LMHxhOfsc9cQ2Z6/giphy.gif' } } },
  { id: '7', title: 'Excited', images: { fixed_height: { url: 'https://media.giphy.com/media/3o7bubbwBCkyP3fG5m/giphy.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/3o7bubbwBCkyP3fG5m/giphy.gif' } } },
  { id: '8', title: 'Party', images: { fixed_height: { url: 'https://media.giphy.com/media/26BRDv0r0bWv9jPU0/giphy.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/26BRDv0r0bWv9jPU0/giphy.gif' } } },
  { id: '9', title: 'Smile', images: { fixed_height: { url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif' } } },
  { id: '10', title: 'Heart', images: { fixed_height: { url: 'https://media.giphy.com/media/3o7TKWtEYP9IS2DYzK/giphy.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/3o7TKWtEYP9IS2DYzK/giphy.gif' } } },
  { id: '11', title: 'Fun', images: { fixed_height: { url: 'https://media.giphy.com/media/l41YtZOb9EUABYMl6/giphy.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/l41YtZOb9EUABYMl6/giphy.gif' } } },
  { id: '12', title: 'Sing', images: { fixed_height: { url: 'https://media.giphy.com/media/3oEjI7pANz6bOvHPeA/giphy.gif', width: '200', height: '150' }, original: { url: 'https://media.giphy.com/media/3oEjI7pANz6bOvHPeA/giphy.gif' } } },
];

// Categories for quick access
const CATEGORIES = [
  { name: '😂 Reacciones', emoji: '😂', search: 'reaction' },
  { name: '💕 Amor', emoji: '💕', search: 'love hearts' },
  { name: '🎉 Celebración', emoji: '🎉', search: 'celebration party' },
  { name: '😮 Asombro', emoji: '😮', search: 'wow amazing' },
  { name: '💪 Motivación', emoji: '💪', search: 'motivation workout' },
  { name: '👋 Hola', emoji: '👋', search: 'hello hi wave' },
  { name: '🌟 Éxito', emoji: '🌟', search: 'success win' },
  { name: '💖 Lindo', emoji: '💖', search: 'cute kawaii' },
];

export const GifPicker = ({ onSelect, onClose }: Props) => {
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Fetch trending GIFs
  const fetchTrendingGifs = useCallback(async (resetOffset = true) => {
    if (resetOffset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentOffset = resetOffset ? 0 : offset;
      const response = await fetch(GIPHY_TRENDING_URL(currentOffset));

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setGifs(prev => resetOffset ? data.data : [...prev, ...data.data]);
        setHasMore(data.data.length >= 24);
        setOffset(currentOffset + data.data.length);
        setUseFallback(false);
      } else {
        setHasMore(false);
        if (resetOffset) {
          setGifs(FALLBACK_GIFS);
          setUseFallback(true);
        }
      }
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      // Use fallback GIFs
      if (resetOffset) {
        setGifs(FALLBACK_GIFS);
        setUseFallback(true);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset]);

  // Fetch search results
  const searchGifs = useCallback(async (query: string, resetOffset = true) => {
    if (!query.trim()) {
      fetchTrendingGifs(true);
      return;
    }

    if (resetOffset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentOffset = resetOffset ? 0 : offset;
      const response = await fetch(GIPHY_SEARCH_URL(query, currentOffset));

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setGifs(prev => resetOffset ? data.data : [...prev, ...data.data]);
        setHasMore(data.data.length >= 24);
        setOffset(currentOffset + data.data.length);
        setUseFallback(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error searching GIFs:', error);
      // Still use fallback for search
      if (resetOffset) {
        setGifs(FALLBACK_GIFS.filter(g =>
          g.title.toLowerCase().includes(query.toLowerCase())
        ));
        setUseFallback(true);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset, fetchTrendingGifs]);

  // Initial load
  useEffect(() => {
    fetchTrendingGifs(true);
  }, []);

  // Handle search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        searchGifs(search, true);
      } else {
        fetchTrendingGifs(true);
      }
      setActiveCategory(null);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Handle category click
  const handleCategoryClick = (category: typeof CATEGORIES[0]) => {
    setSearch(category.search);
    setActiveCategory(category.name);
    searchGifs(category.search, true);
  };

  // Load more
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    if (search.trim()) {
      searchGifs(search, false);
    } else {
      fetchTrendingGifs(false);
    }
  };

  return (
    <div className="gif-picker-popover">
      <div className="gif-picker-header">
        <div className="gif-search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar GIFs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={onClose} className="gif-close"><X size={18} /></button>
      </div>

      {/* Categories */}
      <div className="gif-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            className={`category-btn ${activeCategory === cat.name ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat)}
            title={cat.search}
          >
            <span>{cat.emoji}</span>
            <span className="category-name">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* GIF Grid */}
      <div className="gif-grid">
        {loading ? (
          <div className="gif-loading">
            <Loader2 size={32} className="spin" />
            <p>Cargando GIFs... ✨</p>
          </div>
        ) : useFallback ? (
          <div className="fallback-notice">
            <span>Usando GIFs offline 💫</span>
          </div>
        ) : null}

        {gifs.map((gif) => (
          <img
            key={gif.id}
            src={gif.images.fixed_height.url}
            alt={gif.title || 'GIF'}
            onClick={() => onSelect(gif.images.original.url)}
            className="gif-item"
            loading="lazy"
            title={gif.title}
          />
        ))}

        {hasMore && (
          <button className="load-more-btn" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? <Loader2 size={20} className="spin" /> : 'Cargar más 🎬'}
          </button>
        )}
      </div>
    </div>
  );
};
