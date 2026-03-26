import { useState, useMemo } from 'react';
import { PostCard } from '../components/PostCard';
import { useAppContext } from '../context/useAppContext';
import { sortNew, sortHot, sortTop } from '../utils/sorting';
import { SEO } from '../components/SEO';
import './Feed.css';

export const Feed = () => {
  const { posts, users, currentUser, setCreatePostOpen } = useAppContext();
  const [sortBy] = useState<'hot' | 'new' | 'top'>('hot');

  const openModal = () => setCreatePostOpen(true);

  const sortedPosts = useMemo(() => {
    const postsArray = Object.values(posts).filter(post => {
      if (!currentUser) return false;
      const author = users[post.authorId];
      const isAdminPost = author?.role === 'admin' || author?.username === 'a/sheddit';
      const isFromFollowedUser = currentUser.following?.includes(post.authorId);
      const inFollowedCommunity = currentUser.joinedCommunityIds?.includes(post.communityId);
      const isOwnPost = currentUser.id === post.authorId;

      // Admin posts are visible to everyone
      return isAdminPost || isFromFollowedUser || inFollowedCommunity || isOwnPost;
    });

    if (sortBy === 'hot') return sortHot(postsArray);
    if (sortBy === 'new') return sortNew(postsArray);
    return sortTop(postsArray);
  }, [posts, sortBy, currentUser]);

  return (
    <div className="feed-container">
      <SEO title="Inicio | Mi Feed Chicas ✨" />
      <div className="feed-header">
        <div className="feed-title-row">
          <h2>Inicio</h2>
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
