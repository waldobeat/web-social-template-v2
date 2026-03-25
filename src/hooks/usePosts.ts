/**
 * usePosts - Custom hook for posts data management
 * Separates data fetching concerns from AppContext
 */
import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import type { Post } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { analyzeContent, MODERATION_CONFIG } from '../services/moderationConfig';

interface UsePostsReturn {
    posts: Record<string, Post>;
    isLoading: boolean;
    error: string | null;
    addPost: (content: string, communityId?: string, category?: string) => Promise<void>;
    updatePost: (postId: string, newContent: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    toggleLike: (postId: string) => Promise<void>;
    toggleRepost: (postId: string, targetCommunityId?: string) => Promise<void>;
    toggleHighlight: (postId: string) => Promise<void>;
}

/**
 * Custom hook for managing posts data
 */
export const usePosts = (): UsePostsReturn => {
    const { currentUser, communities } = useAppContext();
    const [posts, setPosts] = useState<Record<string, Post>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Subscribe to posts collection
    useEffect(() => {
        const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const docs: Record<string, Post> = {};
                snapshot.forEach(d => {
                    const data = d.data();
                    const createdAt = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString();
                    docs[d.id] = { id: d.id, ...data, createdAt } as Post;
                });
                setPosts(docs);
                setIsLoading(false);
            },
            (err) => {
                console.error('Posts listener error:', err.message);
                setError(err.message);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const checkContentForSpam = useCallback(async (text: string): Promise<boolean> => {
        if (!currentUser) return false;

        const result = analyzeContent(text);

        if (!result.isApproved) {
            const currentStrikes = currentUser.strikes || 0;
            const newStrikes = currentStrikes + 1;
            const shouldBan = newStrikes >= MODERATION_CONFIG.maxStrikes && MODERATION_CONFIG.autoBanEnabled;

            const remainingStrikes = MODERATION_CONFIG.maxStrikes - newStrikes;
            let warningText = '';

            if (shouldBan) {
                warningText = `🌸 ModBot: Tu cuenta ha sido suspendida permanentemente por múltiples infracciones.`;
            } else {
                warningText = `🌸 ModBot: ${result.reason || 'Tu mensaje fue bloqueado.'} Strike ${newStrikes}/${MODERATION_CONFIG.maxStrikes}. Te quedan ${remainingStrikes} advertencia(s).`;
            }

            await addDoc(collection(db, 'messages'), {
                fromId: 'system_modbot',
                toId: currentUser.id,
                text: warningText,
                createdAt: new Date().toISOString()
            });

            if (shouldBan) {
                await updateDoc(doc(db, 'users', currentUser.id), { strikes: newStrikes, isBanned: true });
                alert(MODERATION_CONFIG.banMessage);
            } else {
                await updateDoc(doc(db, 'users', currentUser.id), { strikes: newStrikes });
                alert(result.reason || `Tu mensaje fue bloqueado por el ModBot. Strike ${newStrikes}/${MODERATION_CONFIG.maxStrikes}.`);
            }
            return true;
        }
        return false;
    }, [currentUser]);

    const addPost = useCallback(async (
        content: string,
        communityId?: string,
        category: string = 'General'
    ) => {
        if (!currentUser) return;

        const isSpam = await checkContentForSpam(content);
        if (isSpam) return;

        await addDoc(collection(db, 'posts'), {
            authorId: currentUser.id,
            communityId: communityId || '',
            content,
            category,
            timestamp: serverTimestamp(),
            likedBy: [],
            repostedBy: [],
            commentIds: [],
            isHighlighted: false,
            likesCount: 0,
            repostCount: 0
        });
    }, [currentUser, checkContentForSpam]);

    const updatePost = useCallback(async (postId: string, newContent: string) => {
        if (!currentUser) return;
        const post = posts[postId];
        if (post && post.authorId === currentUser.id) {
            if (post.commentIds && post.commentIds.length > 0) {
                throw new Error("No se puede editar un post que ya tiene comentarios, amiga. ✨");
            }
            await updateDoc(doc(db, 'posts', postId), { content: newContent });
        }
    }, [currentUser, posts]);

    const deletePost = useCallback(async (postId: string) => {
        if (!currentUser) return;
        try {
            const post = posts[postId];
            if (post && post.authorId === currentUser.id) {
                if (post.commentIds && post.commentIds.length > 0) {
                    const deleteCommentPromises = post.commentIds.map(cid => deleteDoc(doc(db, 'comments', cid)));
                    await Promise.all(deleteCommentPromises);
                }

                await deleteDoc(doc(db, 'posts', postId));
            }
        } catch (err: any) {
            console.error('Delete failed:', err);
            throw err;
        }
    }, [currentUser, posts]);

    const toggleLike = useCallback(async (postId: string) => {
        if (!currentUser) return;
        const p = posts[postId];
        if (!p) return;

        const isLiked = p.likedBy.includes(currentUser.id);
        const postRef = doc(db, 'posts', postId);

        await updateDoc(postRef, {
            likedBy: isLiked ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id),
            likesCount: isLiked ? Math.max(0, (p.likesCount || 0) - 1) : (p.likesCount || 0) + 1
        });
    }, [currentUser, posts]);

    const toggleRepost = useCallback(async (postId: string, targetCommunityId?: string) => {
        if (!currentUser) return;
        const post = posts[postId];
        if (!post) return;

        const isReposted = post.repostedBy.includes(currentUser.id);
        const postRef = doc(db, 'posts', postId);

        await updateDoc(postRef, {
            repostedBy: isReposted ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id),
            repostCount: isReposted ? Math.max(0, (post.repostCount || 0) - 1) : (post.repostCount || 0) + 1
        });

        if (!isReposted) {
            const communityName = targetCommunityId ? (communities[targetCommunityId]?.name || 'Repost') : 'General';
            await addDoc(collection(db, 'posts'), {
                authorId: currentUser.id,
                communityId: targetCommunityId || '',
                content: post.content,
                category: communityName,
                originalPostId: postId,
                timestamp: serverTimestamp(),
                commentIds: [],
                likesCount: 0,
                likedBy: [],
                repostedBy: [],
                repostCount: 0,
                isHighlighted: false,
            });
        }
    }, [currentUser, posts, communities]);

    const toggleHighlight = useCallback(async (postId: string) => {
        if (!currentUser) return;
        const p = posts[postId];
        if (p && p.authorId === currentUser.id) {
            await updateDoc(doc(db, 'posts', postId), { isHighlighted: !p.isHighlighted });
        }
    }, [currentUser, posts]);

    return {
        posts,
        isLoading,
        error,
        addPost,
        updatePost,
        deletePost,
        toggleLike,
        toggleRepost,
        toggleHighlight,
    };
};

export default usePosts;