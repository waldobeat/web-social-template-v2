/**
 * Data Context - Separate data management from AppContext
 * Handles posts, comments, communities, messages, notifications
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { db } from '../services/firebase';
import {
    collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp,
    updateDoc, doc, arrayUnion, arrayRemove, deleteDoc, where
} from 'firebase/firestore';
import type { Post, Comment, Community, Message, AppNotification, MessageRequest } from '../data/mockData';
import { useAuth } from './AuthContext';
import { analyzeContent, MODERATION_CONFIG } from '../services/moderationConfig';

interface DataContextType {
    // Data state
    posts: Record<string, Post>;
    comments: Record<string, Comment>;
    communities: Record<string, Community>;
    messages: Record<string, Message[]>;
    messageRequests: Record<string, MessageRequest>;
    notifications: Record<string, AppNotification>;
    users: Record<string, unknown>;

    // Loading states
    isLoadingPosts: boolean;
    isLoadingComments: boolean;
    isLoadingCommunities: boolean;
    isLoadingMessages: boolean;
    isLoadingNotifications: boolean;

    // Post operations
    addPost: (content: string, communityId?: string, category?: string) => Promise<void>;
    updatePost: (postId: string, newContent: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    toggleLike: (postId: string) => Promise<void>;
    toggleRepost: (postId: string, targetCommunityId?: string) => Promise<void>;
    toggleHighlight: (postId: string) => Promise<void>;

    // Comment operations
    addComment: (text: string, parentId: string) => Promise<void>;
    deleteComment: (commentId: string, parentId: string) => Promise<void>;

    // Community operations
    joinCommunity: (communityId: string) => Promise<void>;
    leaveCommunity: (communityId: string) => Promise<void>;
    addCommunity: (community: Omit<Community, 'id'>) => Promise<string | null>;
    deleteCommunity: (communityId: string) => Promise<void>;
    toggleCommunityMod: (communityId: string, userId: string) => Promise<void>;
    
    // User operations
    toggleFollow: (userId: string) => Promise<void>;

    // Message operations
    sendMessage: (toId: string, text: string) => Promise<void>;
    sendMessageRequest: (toId: string, message: string) => Promise<void>;
    acceptMessageRequest: (requestId: string) => Promise<void>;
    rejectMessageRequest: (requestId: string) => Promise<void>;

    // Notification operations
    markNotificationRead: (id: string) => Promise<void>;

    // Admin operations
    grantPremiumRole: (userId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();

    // Data state
    const [posts, setPosts] = useState<Record<string, Post>>({});
    const [comments, setComments] = useState<Record<string, Comment>>({});
    const [communities, setCommunities] = useState<Record<string, Community>>({});
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [messageRequests, setMessageRequests] = useState<Record<string, MessageRequest>>({});
    const [notifications, setNotifications] = useState<Record<string, AppNotification>>({});
    const [users, setUsers] = useState<Record<string, unknown>>({});

    // Loading states
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

    // Posts subscription with pagination
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
                setIsLoadingPosts(false);
            },
            (err) => {
                console.error('Posts listener error:', err.message);
                setIsLoadingPosts(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Comments subscription
    useEffect(() => {
        const q = query(collection(db, 'comments'), orderBy('timestamp', 'asc'), limit(150));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const docs: Record<string, Comment> = {};
                snapshot.forEach(d => {
                    const data = d.data();
                    const createdAt = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString();
                    docs[d.id] = { id: d.id, ...data, createdAt } as Comment;
                });
                setComments(docs);
                setIsLoadingComments(false);
            },
            (err) => {
                console.error('Comments listener error:', err.message);
                setIsLoadingComments(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Communities subscription
    useEffect(() => {
        const q = query(collection(db, 'communities'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const docs: Record<string, Community> = {};
                snapshot.forEach(d => {
                    docs[d.id] = { id: d.id, ...d.data() } as Community;
                });
                setCommunities(docs);
                setIsLoadingCommunities(false);
            },
            (err) => {
                console.error('Communities listener error:', err.message);
                setIsLoadingCommunities(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Users subscription
    useEffect(() => {
        const q = query(collection(db, 'users'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const docs: Record<string, unknown> = {};
                snapshot.forEach(d => {
                    docs[d.id] = { id: d.id, ...d.data() };
                });
                setUsers(docs);
            },
            (err) => {
                console.error('Users listener error:', err.message);
            }
        );

        return () => unsubscribe();
    }, []);

    // Messages subscription
    useEffect(() => {
        if (!currentUser) return;

        const msgsMap: Map<string, Message> = new Map();

        const processMessages = () => {
            const msgs: Record<string, Message[]> = {};
            Array.from(msgsMap.values()).forEach(m => {
                const otherId = m.fromId === currentUser.id ? m.toId : m.fromId;
                if (!msgs[otherId]) msgs[otherId] = [];
                msgs[otherId].push(m);
            });
            Object.keys(msgs).forEach(k => msgs[k].sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            ));
            setMessages(msgs);
            setIsLoadingMessages(false);
        };

        const qFrom = query(collection(db, 'messages'), where('fromId', '==', currentUser.id));
        const qTo = query(collection(db, 'messages'), where('toId', '==', currentUser.id));

        const unsubFrom = onSnapshot(qFrom, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'removed') {
                    msgsMap.delete(change.doc.id);
                } else {
                    msgsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as Message);
                }
            });
            processMessages();
        }, (err) => console.error('Messages fromListener err:', err.message));

        const unsubTo = onSnapshot(qTo, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'removed') {
                    msgsMap.delete(change.doc.id);
                } else {
                    msgsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as Message);
                }
            });
            processMessages();
        }, (err) => console.error('Messages toListener err:', err.message));

        return () => {
            unsubFrom();
            unsubTo();
        };
    }, [currentUser?.id]);

    // Notifications subscription
    useEffect(() => {
        if (!currentUser) return;

        const q = query(collection(db, 'notifications'), where('recipientId', '==', currentUser.id));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const docs: Record<string, AppNotification> = {};
                snapshot.forEach(d => {
                    docs[d.id] = { id: d.id, ...d.data() } as AppNotification;
                });
                setNotifications(docs);
                setIsLoadingNotifications(false);
            },
            (err) => {
                console.error('Notifications listener error:', err.message);
                setIsLoadingNotifications(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser?.id]);

    // Message Requests subscription
    useEffect(() => {
        if (!currentUser) return;

        const q = query(collection(db, 'messageRequests'), where('toId', '==', currentUser.id));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const docs: Record<string, MessageRequest> = {};
                snapshot.forEach(d => {
                    docs[d.id] = { id: d.id, ...d.data() } as MessageRequest;
                });
                setMessageRequests(docs);
            },
            (err) => {
                console.error('MessageRequests listener error:', err.message);
            }
        );

        return () => unsubscribe();
    }, [currentUser?.id]);

    // Content moderation helper
    const checkContentForSpam = async (text: string): Promise<boolean> => {
        if (!currentUser) return false;

        const result = analyzeContent(text);

        if (!result.isApproved) {
            const currentStrikes = (currentUser.strikes || 0) as number;
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
    };

    // Post operations
    const addPost = async (content: string, communityId?: string, category: string = 'General') => {
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
    };

    const updatePost = async (postId: string, newContent: string) => {
        if (!currentUser) return;
        const post = posts[postId];
        if (post && post.authorId === currentUser.id) {
            if (post.commentIds && post.commentIds.length > 0) {
                throw new Error("No se puede editar un post que ya tiene comentarios, amiga. ✨");
            }
            await updateDoc(doc(db, 'posts', postId), { content: newContent });
        }
    };

    const deletePost = async (postId: string) => {
        if (!currentUser) return;
        const post = posts[postId];
        if (post && post.authorId === currentUser.id) {
            if (post.commentIds && post.commentIds.length > 0) {
                const deleteCommentPromises = post.commentIds.map(cid => deleteDoc(doc(db, 'comments', cid)));
                await Promise.all(deleteCommentPromises);
            }
            await deleteDoc(doc(db, 'posts', postId));
        }
    };

    const toggleLike = async (postId: string) => {
        if (!currentUser) return;
        const p = posts[postId];
        if (!p) return;

        const isLiked = p.likedBy.includes(currentUser.id);
        await updateDoc(doc(db, 'posts', postId), {
            likedBy: isLiked ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id),
            likesCount: isLiked ? Math.max(0, (p.likesCount || 0) - 1) : (p.likesCount || 0) + 1
        });
    };

    const toggleRepost = async (postId: string, targetCommunityId?: string) => {
        if (!currentUser) return;
        const post = posts[postId];
        if (!post) return;

        const isReposted = post.repostedBy.includes(currentUser.id);
        await updateDoc(doc(db, 'posts', postId), {
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
    };

    const toggleHighlight = async (postId: string) => {
        if (!currentUser) return;
        const p = posts[postId];
        if (p && p.authorId === currentUser.id) {
            await updateDoc(doc(db, 'posts', postId), { isHighlighted: !p.isHighlighted });
        }
    };

    // Comment operations
    const addComment = async (text: string, parentId: string) => {
        if (!currentUser) return;

        const isSpam = await checkContentForSpam(text);
        if (isSpam) return;

        const docRef = await addDoc(collection(db, 'comments'), {
            authorId: currentUser.id,
            text,
            parentId,
            timestamp: serverTimestamp(),
            likedBy: []
        });

        const isPost = !!posts[parentId];
        const parentRef = doc(db, isPost ? 'posts' : 'comments', parentId);

        try {
            await updateDoc(parentRef, {
                commentIds: arrayUnion(docRef.id)
            });
        } catch (err) {
            console.error("Error updating parent commentIds:", err);
        }
    };

    const deleteComment = async (commentId: string, parentId: string) => {
        if (!currentUser) return;
        const isPost = !!posts[parentId];
        const parentRef = doc(db, isPost ? 'posts' : 'comments', parentId);
        
        await deleteDoc(doc(db, 'comments', commentId));
        await updateDoc(parentRef, {
            commentIds: arrayRemove(commentId)
        });
    };

    // Community operations
    const joinCommunity = async (communityId: string) => {
        if (!currentUser) return;
        await updateDoc(doc(db, 'users', currentUser.id), {
            joinedCommunityIds: arrayUnion(communityId)
        });
        await updateDoc(doc(db, 'communities', communityId), {
            memberIds: arrayUnion(currentUser.id),
            memberCount: (communities[communityId]?.memberCount || 0) + 1
        });
    };

    const leaveCommunity = async (communityId: string) => {
        if (!currentUser) return;
        await updateDoc(doc(db, 'users', currentUser.id), {
            joinedCommunityIds: arrayRemove(communityId)
        });
        await updateDoc(doc(db, 'communities', communityId), {
            memberIds: arrayRemove(currentUser.id),
            memberCount: Math.max(0, (communities[communityId]?.memberCount || 1) - 1)
        });
    };

    const addCommunity = async (community: Omit<Community, 'id'>): Promise<string | null> => {
        if (!currentUser) return null;

        const docRef = await addDoc(collection(db, 'communities'), {
            ...community,
            ownerId: currentUser.id,
            memberIds: [currentUser.id],
            memberCount: 1,
            moderatorIds: [], // Human moderators
            botModeratorId: `b/Mod_${community.name.replace(/^c\//, '')}`, // Professional bot name
            moderationType: 'hybrid',
            createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, 'users', currentUser.id), {
            joinedCommunityIds: arrayUnion(docRef.id)
        });

        return docRef.id;
    };

    const deleteCommunity = async (communityId: string) => {
        if (!currentUser) return;
        const community = communities[communityId];
        if (community && community.ownerId === currentUser.id) {
            if ((community.memberCount || 0) >= 1000) {
                alert("No puedes eliminar una comunidad con más de 1000 miembros. Debes abandonarla.");
                return;
            }
            if (window.confirm('¿Estás segura de eliminar esta comunidad? Esta acción no se puede deshacer.')) {
                await deleteDoc(doc(db, 'communities', communityId));
            }
        }
    };

    const toggleCommunityMod = async (communityId: string, userId: string) => {
        if (!currentUser) return;
        const community = communities[communityId];
        if (!community) return;
        
        const isOwner = community.ownerId === currentUser.id;
        const isAdmin = (currentUser as any).email === 'waldobeatmaker@gmail.com' || currentUser.username === 'u/Sheddit';
        
        if (!isOwner && !isAdmin) return;

        const isMod = (community.moderatorIds || []).includes(userId);
        
        await updateDoc(doc(db, 'communities', communityId), {
            moderatorIds: isMod ? arrayRemove(userId) : arrayUnion(userId)
        });
    };

    const toggleFollow = async (userId: string) => {
        if (!currentUser) return;
        const targetUser = users[userId];
        if (!targetUser) return;

        const realCurrentUser = (users[currentUser.id] as any) || currentUser;
        const isFollowing = (realCurrentUser.following || []).includes(userId);

        const currentUserRef = doc(db, 'users', currentUser.id);
        const targetUserRef = doc(db, 'users', userId);

        if (isFollowing) {
            await updateDoc(currentUserRef, { following: arrayRemove(userId) });
            await updateDoc(targetUserRef, { followers: arrayRemove(currentUser.id) });
        } else {
            await updateDoc(currentUserRef, { following: arrayUnion(userId) });
            await updateDoc(targetUserRef, { followers: arrayUnion(currentUser.id) });
            await addDoc(collection(db, 'notifications'), {
                recipientId: userId,
                senderId: currentUser.id,
                type: 'follow',
                referenceId: currentUser.id,
                message: '',
                createdAt: new Date().toISOString(),
                read: false
            });
        }
    };

    // Message operations
    const sendMessage = async (toId: string, text: string) => {
        if (!currentUser) return;
        await addDoc(collection(db, 'messages'), {
            fromId: currentUser.id,
            toId,
            text,
            createdAt: new Date().toISOString()
        });
    };

    const sendMessageRequest = async (toId: string, message: string) => {
        if (!currentUser) return;
        await addDoc(collection(db, 'messageRequests'), {
            fromId: currentUser.id,
            toId,
            message,
            createdAt: new Date().toISOString(),
            status: 'pending'
        });
    };

    const acceptMessageRequest = async (requestId: string) => {
        await updateDoc(doc(db, 'messageRequests', requestId), { status: 'accepted' });
    };

    const rejectMessageRequest = async (requestId: string) => {
        await updateDoc(doc(db, 'messageRequests', requestId), { status: 'rejected' });
    };

    // Notification operations
    const markNotificationRead = async (id: string) => {
        await updateDoc(doc(db, 'notifications', id), { read: true });
    };

    // Admin operations
    const grantPremiumRole = async (userId: string) => {
        if (!currentUser) return;
        // Check if admin by email or username
        const isAdmin = (currentUser as any).email === 'waldobeatmaker@gmail.com' || currentUser.username === 'u/Sheddit' || currentUser.id === 'xhE6DhfT6dbNkzKH9dMCVn8mpXi2';
        if (!isAdmin) {
            console.error('Unauthorized: Solo el administrador puede otorgar Premium.');
            alert('No tienes permisos de administrador.');
            return;
        }
        
        try {
            await updateDoc(doc(db, 'users', userId), { isPremium: true });
            alert("¡Usuario ascendido a Premium exitosamente! 🌟");
        } catch (error) {
            console.error("Error al otorgar premium:", error);
            alert("Hubo un error al guardar en la base de datos.");
        }
    };

    const value: DataContextType = {
        posts,
        comments,
        communities,
        messages,
        messageRequests,
        notifications,
        users,
        isLoadingPosts,
        isLoadingComments,
        isLoadingCommunities,
        isLoadingMessages,
        isLoadingNotifications,
        addPost,
        updatePost,
        deletePost,
        toggleLike,
        toggleRepost,
        toggleHighlight,
        addComment,
        deleteComment,
        joinCommunity,
        leaveCommunity,
        addCommunity,
        deleteCommunity,
        toggleCommunityMod,
        toggleFollow,
        sendMessage,
        sendMessageRequest,
        acceptMessageRequest,
        rejectMessageRequest,
        markNotificationRead,
        grantPremiumRole,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export default DataContext;