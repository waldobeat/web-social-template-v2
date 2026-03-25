import { useState, useMemo } from 'react';
import { PostCard } from '../components/PostCard';
import { useAppContext } from '../context/AppContext';
import { sortNew, sortHot, sortTop } from '../utils/sorting';
import './Feed.css';

export const Feed = () => {
  const { posts, currentUser, setCreatePostOpen } = useAppContext();
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');

  const openModal = () => setCreatePostOpen(true);

  const sortedPosts = useMemo(() => {
    const postsArray = Object.values(posts).filter(post => {
      if (!currentUser) return false;
      const isFromFollowedUser = currentUser.following?.includes(post.authorId);
      const inFollowedCommunity = currentUser.joinedCommunityIds?.includes(post.communityId);
      const isOwnPost = currentUser.id === post.authorId;
      return isFromFollowedUser || inFollowedCommunity || isOwnPost;
    });

    if (sortBy === 'hot') return sortHot(postsArray);
    if (sortBy === 'new') return sortNew(postsArray);
    return sortTop(postsArray);
  }, [posts, sortBy, currentUser]);

  return (
    <div className="feed-container">
      <div className="feed-header">
        <div className="feed-title-row">
          <h2>Inicio</h2>
        </div>
        <div className="sort-tabs">
          <button className={`sort-tab ${sortBy === 'hot' ? 'active' : ''}`} onClick={() => setSortBy('hot')}>🔥 Hot</button>
          <button className={`sort-tab ${sortBy === 'new' ? 'active' : ''}`} onClick={() => setSortBy('new')}>✨ New</button>
          <button className={`sort-tab ${sortBy === 'top' ? 'active' : ''}`} onClick={() => setSortBy('top')}>🏆 Top</button>
        </div>
      </div>
      
      <div className="create-post-trigger" onClick={openModal}>
        <img src={currentUser?.avatar} alt="me" className="trigger-avatar" />
        <div className="trigger-input">Cuéntame algo, amiga... ✨</div>
      </div>
      
      <div className="posts-list">
        {sortedPosts.length > 0 ? (
          sortedPosts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="empty-feed">
            <h3>Tu feed está muy tranquilo... ✨</h3>
            <p>Sigue a más chicas o únete a comunidades para ver sus publicaciones aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
};
