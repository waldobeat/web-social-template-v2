import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Send, Smile, Gift, BadgeCheck } from 'lucide-react';
import { GifPicker } from './GifPicker';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { useNavigate } from 'react-router-dom';
import './CommentSection.css';

interface Props {
  postId: string;
}

export const CommentSection = ({ postId }: Props) => {
  const { comments, users, currentUser, addComment } = useAppContext();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [showGifs, setShowGifs] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const postComments = Object.values(comments).filter(c => c.parentId === postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    const textToSubmit = newComment;
    setNewComment(''); // Clear immediately for better UX (optimistic)

    try {
      await addComment({
        authorId: currentUser.id,
        text: textToSubmit,
        parentId: postId,
        createdAt: new Date().toISOString()
      });
      setShowEmoji(false);
    } catch (err: any) {
      alert("No se pudo enviar el comentario. Inténtalo de nuevo.");
      setNewComment(textToSubmit); // Restore text if failed
    }
  };

  const onGifSelect = async (url: string) => {
    if (!currentUser) return;
    await addComment({
      authorId: currentUser.id,
      text: `![gif](${url})`,
      parentId: postId,
      createdAt: new Date().toISOString()
    });
    setShowGifs(false);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewComment(prev => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  return (
    <div className="comment-section">
      <div className="comments-header">Comentarios</div>

      <div className="comments-list">
        {postComments.map(comment => {
          const author = users[comment.authorId];
          const isGif = comment.text.startsWith('![gif](');
          const gifUrl = isGif ? comment.text.match(/\((.*?)\)/)?.[1] : null;

          return (
            <div key={comment.id} className="comment-item">
              <img
                src={author?.avatar}
                alt={author?.username}
                className="comment-avatar"
                onClick={() => navigate(`/profile/${author?.id}`)}
                style={{ cursor: 'pointer' }}
              />
              <div className="comment-content">
                <div className="comment-author" onClick={() => navigate(`/profile/${author?.id}`)} style={{ cursor: 'pointer' }}>
                  u/{author?.username?.replace(/^u\//, '')}
                  {author?.isVerified && <BadgeCheck size={12} color="#1DA1F2" style={{ marginLeft: 4 }} />}
                </div>
                {isGif ? (
                  <img src={gifUrl!} alt="comment gif" className="comment-gif" />
                ) : (
                  <p className="comment-text">{comment.text}</p>
                )}
                <div className="comment-meta">
                  Hace un momento •
                  <button className="reply-btn" onClick={() => setNewComment(`u/${author?.username?.replace(/^u\//, '')} `)}>Responder</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <img src={currentUser?.avatar} alt="me" className="form-avatar" />
        <div className="comment-input-wrapper">
          <input
            type="text"
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="comment-actions">
            <button type="button" onClick={() => setShowGifs(!showGifs)} className="action-icon">
              <Gift size={20} />
            </button>
            <div style={{ position: 'relative' }}>
              <button type="button" className="action-icon" onClick={() => setShowEmoji(!showEmoji)}>
                <Smile size={20} />
              </button>
              {showEmoji && (
                <div className="comment-emoji-picker">
                  <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                </div>
              )}
            </div>
            <button type="submit" className="send-btn" disabled={!newComment.trim()}>
              <Send size={20} />
            </button>
          </div>
          {showGifs && <GifPicker onSelect={onGifSelect} onClose={() => setShowGifs(false)} />}
        </div>
      </form>
    </div>
  );
};
