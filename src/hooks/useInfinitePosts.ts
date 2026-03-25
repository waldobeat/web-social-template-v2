/**
 * Firebase Pagination Hook - Cursor-based infinite scroll
 * Provides efficient pagination for large datasets
 */
import { useState, useCallback } from 'react';
import { db } from '../services/firebase';
import {
    collection, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot
} from 'firebase/firestore';
import type { Post } from '../data/mockData';

interface UseInfinitePostsOptions {
    initialLimit?: number;
    pageSize?: number;
}

interface UseInfinitePostsReturn {
    posts: Post[];
    isLoading: boolean;
    hasMore: boolean;
    error: string | null;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
}

/**
 * Custom hook for paginated posts with cursor-based navigation
 * Uses Firestore's startAfter for efficient cursor-based pagination
 */
export const useInfinitePosts = (options: UseInfinitePostsOptions = {}): UseInfinitePostsReturn => {
    const { initialLimit = 20, pageSize = 20 } = options;

    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cursor for pagination - last document from previous query
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);

    // Initial load
    const loadInitial = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const postsRef = collection(db, 'posts');
            const q = query(
                postsRef,
                orderBy('timestamp', 'desc'),
                limit(initialLimit)
            );

            const snapshot = await getDocs(q);

            const newPosts: Post[] = snapshot.docs.map(doc => {
                const data = doc.data();
                const createdAt = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString();
                return { id: doc.id, ...data, createdAt } as Post;
            });

            setPosts(newPosts);

            // Set cursor for next page
            if (snapshot.docs.length > 0) {
                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            }

            // Check if there are more results
            setHasMore(snapshot.docs.length === initialLimit);
        } catch (err: any) {
            setError(err.message);
            console.error('Error loading initial posts:', err);
        } finally {
            setIsLoading(false);
        }
    }, [initialLimit]);

    // Load more posts (pagination)
    const loadMore = useCallback(async () => {
        if (!lastDoc || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const postsRef = collection(db, 'posts');
            const q = query(
                postsRef,
                orderBy('timestamp', 'desc'),
                startAfter(lastDoc),
                limit(pageSize)
            );

            const snapshot = await getDocs(q);

            const newPosts: Post[] = snapshot.docs.map(doc => {
                const data = doc.data();
                const createdAt = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString();
                return { id: doc.id, ...data, createdAt } as Post;
            });

            // Append new posts to existing ones
            setPosts(prev => [...prev, ...newPosts]);

            // Update cursor
            if (snapshot.docs.length > 0) {
                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            }

            // Check if there are more results
            setHasMore(snapshot.docs.length === pageSize);
        } catch (err: any) {
            setError(err.message);
            console.error('Error loading more posts:', err);
        } finally {
            setIsLoading(false);
        }
    }, [lastDoc, isLoading, pageSize]);

    // Refresh - reset everything and load from start
    const refresh = useCallback(async () => {
        setLastDoc(null);
        setPosts([]);
        setHasMore(true);
        await loadInitial();
    }, [loadInitial]);

    // Load initial data on mount
    useState(() => {
        loadInitial();
    });

    return {
        posts,
        isLoading,
        hasMore,
        error,
        loadMore,
        refresh,
    };
};

export default useInfinitePosts;