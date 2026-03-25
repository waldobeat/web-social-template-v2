import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { INITIAL_POSTS, INITIAL_USERS, INITIAL_COMMUNITIES, INITIAL_COMMENTS, INITIAL_MESSAGES, type Post, type UserProfile, type Community, type Comment, type Message, type AppNotification, type MessageRequest } from '../data/mockData';
import { auth, db, signInWithGoogle } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, setDoc, doc, updateDoc, arrayUnion, where, getDocs, arrayRemove, deleteDoc, limit, getDoc } from 'firebase/firestore';
import { seedDefaultCommunities } from '../services/seedData';
import { analyzeContent, MODERATION_CONFIG } from '../services/moderationConfig';

interface AppState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileLoaded: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, username: string, extraData: { age: string, interests: string[] }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  posts: Record<string, Post>;
  users: Record<string, UserProfile>;
  communities: Record<string, Community>;
  comments: Record<string, Comment>;
  messages: Record<string, Message[]>;
  messageRequests: Record<string, MessageRequest>;
  notifications: Record<string, AppNotification>;
  addPost: (post: Omit<Post, 'id'>) => Promise<void>;
  addComment: (comment: Omit<Comment, 'id'>) => Promise<void>;
  updatePost: (postId: string, newContent: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  toggleRepost: (postId: string, targetCommunityId?: string) => Promise<void>;
  toggleHighlight: (postId: string) => Promise<void>;
  toggleFollow: (userId: string) => Promise<void>;
  updateProfile: (data: { username?: string; bio?: string; avatar?: string; isVerified?: boolean }) => Promise<void>;
  addCommunity: (community: Omit<Community, 'id'>) => Promise<string | null>;
  sendMessage: (toId: string, text: string) => Promise<void>;
  sendMessageRequest: (toId: string, message: string) => Promise<void>;
  acceptMessageRequest: (requestId: string) => Promise<void>;
  rejectMessageRequest: (requestId: string) => Promise<void>;
  joinCommunity: (communityId: string) => Promise<void>;
  leaveCommunity: (communityId: string) => Promise<void>;
  deleteCommunity: (communityId: string) => Promise<void>;
  isCreatePostOpen: boolean;
  setCreatePostOpen: (open: boolean) => void;
  createNotification: (recipientId: string, type: AppNotification['type'], referenceId?: string, message?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [communities, setCommunities] = useState(INITIAL_COMMUNITIES);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [messageRequests, setMessageRequests] = useState<Record<string, MessageRequest>>({});
  const [notifications, setNotifications] = useState<Record<string, AppNotification>>({});
  const [isCreatePostOpen, setCreatePostOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const currentUser = (currentUserId && users[currentUserId]) ? users[currentUserId] : null;

  useEffect(() => {
    // Only initialize if Firebase is configured
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUserId(user.uid);

        // Instant profile load to fix "tarda mucho"
        try {
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (docSnap.exists()) {
            setProfileLoaded(true);
          } else {
            setProfileLoaded(true); // Let them in even if doc missing
          }
        } catch (e) {
          console.error("Fast load failed:", e);
          setProfileLoaded(true);
        }

        setIsLoading(false);
      } else {
        setIsAuthenticated(false);
        setCurrentUserId(null);
        setProfileLoaded(true); // Nothing to load
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Set profileLoaded when currentUserId is found in users or timeout to prevent infinite loading
  useEffect(() => {
    if (currentUserId) {
      if (users[currentUserId]) {
        setProfileLoaded(true);
      } else {
        // Safety timeout to avoid infinite loading if profile is missing/deleted from Firestore
        const timer = setTimeout(() => {
          console.warn('Profile not loaded after 5s, forcing loaded state to exit loading screen.');
          setProfileLoaded(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUserId, users]);

  // Firestore Listeners
  useEffect(() => {
    if (!currentUserId) {
      setProfileLoaded(false);
      return;
    }

    const qPosts = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50));
    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      const docs: Record<string, Post> = {};
      snapshot.forEach(d => {
        const data = d.data();
        const createdAt = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString();
        docs[d.id] = { id: d.id, ...data, createdAt } as Post;
      });
      setPosts(docs);
    }, (err) => console.log("Posts listener blocked:", err.message));

    const qComments = query(collection(db, 'comments'), orderBy('timestamp', 'asc'), limit(150));
    const unsubComments = onSnapshot(qComments, (snapshot) => {
      const docs: Record<string, Comment> = {};
      snapshot.forEach(d => {
        const data = d.data();
        const createdAt = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString();
        docs[d.id] = { id: d.id, ...data, createdAt } as Comment;
      });
      setComments(docs);
    }, (err) => console.log("Comments listener blocked:", err.message));

    const qCommunities = query(collection(db, 'communities'));
    const unsubCommunities = onSnapshot(qCommunities, (snapshot) => {
      const docs: Record<string, Community> = {};
      snapshot.forEach(d => { docs[d.id] = { id: d.id, ...d.data() } as Community; });
      setCommunities(docs);

      // Seed default communities if NONE exist
      if (snapshot.empty) {
        seedDefaultCommunities();
      }
    }, (err) => console.log("Communities listener blocked:", err.message));

    const qUsers = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      const docs: Record<string, UserProfile> = {};
      let userBanned = false;
      snapshot.forEach(d => {
        docs[d.id] = { id: d.id, ...d.data() } as UserProfile;
        if (d.id === currentUserId && docs[d.id].isBanned) userBanned = true;
      });
      setUsers(docs);
      if (userBanned) {
        alert("Tu cuenta ha sido suspendida permanentemente por el ModBot debido a múltiples infracciones.");
        signOut(auth); // Automatically kick out
      }
    }, (err) => console.log("Users listener blocked:", err.message));

    const qMessages = query(collection(db, 'messages'), limit(200));
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      const msgs: Record<string, Message[]> = {};
      snapshot.forEach(d => {
        const m = { id: d.id, ...d.data() } as Message;
        const otherId = m.fromId === currentUserId ? m.toId : m.fromId;
        if (!msgs[otherId]) msgs[otherId] = [];
        msgs[otherId].push(m);
      });
      Object.keys(msgs).forEach(k => msgs[k].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      setMessages(msgs);
    }, (err) => console.log("Messages listener blocked:", err.message));

    const qNotifs = query(collection(db, 'notifications'), where('recipientId', '==', currentUserId));
    const unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
      const docs: Record<string, AppNotification> = {};
      snapshot.forEach(d => { docs[d.id] = { id: d.id, ...d.data() } as AppNotification; });
      setNotifications(docs);
    }, (err) => console.log("Notifications listener blocked:", err.message));

    // Message Requests listener
    const qRequests = query(collection(db, 'messageRequests'), where('toId', '==', currentUserId));
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      const docs: Record<string, MessageRequest> = {};
      snapshot.forEach(d => { docs[d.id] = { id: d.id, ...d.data() } as MessageRequest; });
      setMessageRequests(docs);
    }, (err) => console.log("MessageRequests listener blocked:", err.message));

    return () => {
      unsubPosts();
      unsubComments();
      unsubCommunities();
      unsubUsers();
      unsubMessages();
      unsubNotifs();
      unsubRequests();
    };
  }, [currentUserId]);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    // Sign in with Google Popup
    const result = await signInWithGoogle();
    const user = result.user;

    // Check if user profile exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      // Create new user profile for Google sign-in
      const emailParts = user.email?.split('@') || ['user'];
      const defaultUsername = `u/${emailParts[0]}`;

      // Get Google avatar or generate one
      const googleAvatar = user.photoURL || `https://robohash.org/${user.uid}?set=set4&bgset=bg1&size=200x200`;

      const newProfile: UserProfile = {
        id: user.uid,
        username: defaultUsername,
        avatar: googleAvatar,
        bio: '¡Nueva en SoloChicas! ✨',
        followers: [],
        following: [],
        joinedCommunityIds: [],
        interests: [],
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);

      // Update local state
      setUsers(prev => ({
        ...prev,
        [user.uid]: newProfile
      }));
    }
  };

  const register = async (email: string, pass: string, username: string, extraData: { age: string, interests: string[] }) => {
    // 1. Check if username is unique
    const q = query(collection(db, 'users'), where('username', '==', username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error('Este nombre de usuario ya está en uso. Elige otro, amiga. ✨');
    }

    // 2. Create Auth User
    const res = await createUserWithEmailAndPassword(auth, email, pass);

    // 3. Create beautiful female robot avatar (set4 is "female robots")
    const robotAvatar = `https://robohash.org/${res.user.uid}?set=set4&bgset=bg1&size=200x200`;

    // 4. Create Firestore Profile
    const userProfile: UserProfile = {
      id: res.user.uid,
      username,
      avatar: robotAvatar,
      bio: '¡Nueva en SoloChicas! ✨',
      followers: [],
      following: [],
      joinedCommunityIds: [],
      age: extraData.age || '',
      interests: extraData.interests || [],
      mood: '😊'
    };
    await setDoc(doc(db, 'users', res.user.uid), userProfile);
  };

  const updateProfile = async (data: { username?: string; bio?: string; avatar?: string; isVerified?: boolean }) => {
    if (!currentUser) return;

    const updateData: Record<string, any> = {};
    if (data.username) updateData.username = data.username;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatar) updateData.avatar = data.avatar;
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;

    await updateDoc(doc(db, 'users', currentUser.id), updateData);

    // Update local state
    setUsers(prev => ({
      ...prev,
      [currentUser.id]: {
        ...currentUser,
        ...data,
        followers: currentUser.followers,
        following: currentUser.following
      } as UserProfile
    }));
  };

  const logout = async () => {
    await signOut(auth);
  };

  const createNotification = async (recipientId: string, type: AppNotification['type'], referenceId?: string, message?: string) => {
    if (!currentUser || recipientId === currentUser.id) return;
    await addDoc(collection(db, 'notifications'), {
      recipientId,
      senderId: currentUser.id,
      type,
      referenceId: referenceId || '',
      message: message || '',
      createdAt: new Date().toISOString(),
      read: false
    });
  };

  const markNotificationRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const checkContentForSpam = async (text: string) => {
    if (!currentUser) return false;

    // Use the improved moderation system
    const result = analyzeContent(text);

    if (!result.isApproved) {
      const currentStrikes = currentUser.strikes || 0;
      const newStrikes = currentStrikes + 1;
      const shouldBan = newStrikes >= MODERATION_CONFIG.maxStrikes && MODERATION_CONFIG.autoBanEnabled;

      // Auto-DM from ModBot with improved messaging
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

  const addPost = async (post: Partial<Post>) => {
    if (!currentUser) return;
    const isSpam = await checkContentForSpam(post.content || '');
    if (isSpam) return; // Block post

    await addDoc(collection(db, 'posts'), {
      authorId: currentUser.id,
      communityId: post.communityId || '',
      content: post.content || '',
      category: post.category || 'General',
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
    try {
      const post = posts[postId];
      if (post && post.authorId === currentUser.id) {
        // 1. Delete associated comments
        if (post.commentIds && post.commentIds.length > 0) {
          const deleteCommentPromises = post.commentIds.map(cid => deleteDoc(doc(db, 'comments', cid)));
          await Promise.all(deleteCommentPromises);
        }

        // 2. Delete all reposts of this post
        const q = query(collection(db, 'posts'), where('originalPostId', '==', postId));
        const sn = await getDocs(q);
        const deleteRepostPromises = sn.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deleteRepostPromises);

        // 3. Delete the post itself
        await deleteDoc(doc(db, 'posts', postId));
        console.log("Post and associated content deleted successfully:", postId);
      } else {
        console.warn("Delete attempt on non-existent or unauthorized post:", postId);
      }
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert("No se pudo borrar el post: " + err.message);
    }
  };

  const addComment = async (comment: Omit<Comment, 'id'>) => {
    if (!currentUser) return;
    const isSpam = await checkContentForSpam(comment.text);
    if (isSpam) return; // Block comment

    const docRef = await addDoc(collection(db, 'comments'), {
      ...comment,
      timestamp: serverTimestamp(),
      likedBy: []
    });

    // Update parent (post or comment) reference
    const isPost = !!posts[comment.parentId];
    const parentRef = doc(db, isPost ? 'posts' : 'comments', comment.parentId);

    try {
      await updateDoc(parentRef, {
        commentIds: arrayUnion(docRef.id)
      });
      if (isPost) {
        createNotification(posts[comment.parentId].authorId, 'comment', comment.parentId);
      }
    } catch (err) {
      console.error("Error updating parent commentIds:", err);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!currentUser) return;
    const p = posts[postId];
    if (!p) return;
    const isLiked = p.likedBy.includes(currentUser.id);
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likedBy: isLiked ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id),
      likesCount: isLiked ? Math.max(0, (p.likesCount || 0) - 1) : (p.likesCount || 0) + 1
    });
    if (!isLiked) {
      createNotification(p.authorId, 'like', postId);
    }
  };

  const toggleHighlight = async (postId: string) => {
    if (!currentUser) return;
    const p = posts[postId];
    if (p && p.authorId === currentUser.id) {
      await updateDoc(doc(db, 'posts', postId), { isHighlighted: !p.isHighlighted });
    }
  };

  const toggleRepost = async (postId: string, targetCommunityId?: string) => {
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
      await addDoc(collection(db, 'posts'), {
        authorId: currentUser.id,
        communityId: targetCommunityId || '',
        content: post.content,
        category: targetCommunityId ? (communities[targetCommunityId]?.name || 'Repost') : 'General',
        originalPostId: postId,
        timestamp: serverTimestamp(),
        commentIds: [],
        likesCount: 0,
        likedBy: [],
        repostCount: 0,
        repostedBy: [],
        isHighlighted: false
      });
    } else {
      // Find and delete the repost doc(s) created by this user for this original post
      try {
        const q = query(
          collection(db, 'posts'),
          where('originalPostId', '==', postId),
          where('authorId', '==', currentUser.id)
        );
        const sn = await getDocs(q);
        const deletePromises = sn.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      } catch (err) {
        console.error("Error removing repost doc:", err);
      }
    }
  };

  const toggleFollow = async (userId: string) => {
    if (!currentUser) return;
    const targetUser = users[userId];
    if (!targetUser) return;

    const isFollowing = (currentUser.following || []).includes(userId);

    const currentUserRef = doc(db, 'users', currentUser.id);
    const targetUserRef = doc(db, 'users', userId);

    if (isFollowing) {
      await updateDoc(currentUserRef, { following: arrayRemove(userId) });
      await updateDoc(targetUserRef, { followers: arrayRemove(currentUser.id) });
    } else {
      await updateDoc(currentUserRef, { following: arrayUnion(userId) });
      await updateDoc(targetUserRef, { followers: arrayUnion(currentUser.id) });
      createNotification(userId, 'follow', currentUser.id);
    }
  };

  const addCommunity = async (community: Omit<Community, 'id'>) => {
    if (!currentUser) return null;
    const docRef = await addDoc(collection(db, 'communities'), {
      ...community,
      ownerId: currentUser.id,
      memberIds: [currentUser.id],
      memberCount: 1,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'users', currentUser.id), {
      joinedCommunityIds: arrayUnion(docRef.id)
    });

    return docRef.id;
  };

  const sendMessage = async (toId: string, text: string) => {
    if (!currentUser) return;

    // Check if users follow each other
    const targetUser = users[toId];
    const followsMe = targetUser?.following?.includes(currentUser.id);
    const iFollowThem = currentUser.following?.includes(toId);

    // If they don't follow each other, create a request instead
    if (!followsMe || !iFollowThem) {
      // Check if there's already a pending request
      const existingRequest = Object.values(messageRequests).find(
        r => r.fromId === currentUser.id && r.toId === toId && r.status === 'pending'
      );

      if (existingRequest) {
        alert('Ya has enviado una solicitud de mensaje a esta persona. Espera a que la acepte. 💌');
        return;
      }

      // Send message request
      await sendMessageRequest(toId, text);
      return;
    }

    const isSpam = await checkContentForSpam(text);
    if (isSpam) return; // Block

    await addDoc(collection(db, 'messages'), {
      fromId: currentUser.id,
      toId,
      text,
      createdAt: new Date().toISOString()
    });
    createNotification(toId, 'message', undefined, 'Te ha enviado un mensaje.');
  };

  // Send a message request (when users don't follow each other)
  const sendMessageRequest = async (toId: string, message: string) => {
    if (!currentUser) return;

    const isSpam = await checkContentForSpam(message);
    if (isSpam) return;

    await addDoc(collection(db, 'messageRequests'), {
      fromId: currentUser.id,
      toId,
      message,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });

    // Notify the user
    createNotification(toId, 'message', undefined, 'Te ha enviado una solicitud de mensaje. 💌');
  };

  // Accept a message request
  const acceptMessageRequest = async (requestId: string) => {
    if (!currentUser) return;
    const request = messageRequests[requestId];
    if (!request) return;

    await updateDoc(doc(db, 'messageRequests', requestId), { status: 'accepted' });

    // Auto-follow the requester
    const currentUserRef = doc(db, 'users', currentUser.id);
    const requesterRef = doc(db, 'users', request.fromId);

    await updateDoc(currentUserRef, { following: arrayUnion(request.fromId) });
    await updateDoc(requesterRef, { followers: arrayUnion(currentUser.id) });

    // Send a welcome message
    await addDoc(collection(db, 'messages'), {
      fromId: 'system_modbot',
      toId: request.fromId,
      text: `💌 ¡Hola! ${currentUser.username} ha aceptado tu solicitud de mensaje. Ahora pueden chatear libremente.`,
      createdAt: new Date().toISOString()
    });

    createNotification(request.fromId, 'message', undefined, 'ha aceptado tu solicitud de mensaje. ¡Ahora pueden chatear!');
  };

  // Reject a message request
  const rejectMessageRequest = async (requestId: string) => {
    if (!currentUser) return;
    const request = messageRequests[requestId];
    if (!request) return;

    await updateDoc(doc(db, 'messageRequests', requestId), { status: 'rejected' });

    // Notify the requester
    createNotification(request.fromId, 'message', undefined, 'No ha aceptado tu solicitud de mensaje. 💔');
  };

  const joinCommunity = async (communityId: string) => {
    if (!currentUser) return;
    const commRef = doc(db, 'communities', communityId);
    await updateDoc(commRef, {
      memberIds: arrayUnion(currentUser.id),
      memberCount: (communities[communityId]?.memberCount || 0) + 1
    });
    await updateDoc(doc(db, 'users', currentUser.id), {
      joinedCommunityIds: arrayUnion(communityId)
    });
  };

  const leaveCommunity = async (communityId: string) => {
    if (!currentUser) return;
    const community = communities[communityId];
    if (!community) return;

    const isOwner = community.ownerId === currentUser.id;
    const memberCount = community.memberCount || 0;

    if (isOwner && memberCount >= 1000) {
      const otherMembers = (community.memberIds || []).filter(id => id !== currentUser.id);
      if (otherMembers.length > 0) {
        const newOwnerId = otherMembers[Math.floor(Math.random() * otherMembers.length)];
        await updateDoc(doc(db, 'communities', communityId), {
          ownerId: newOwnerId
        });
        alert(`Has abandonado la comunidad. La propiedad ha sido transferida a un miembro aleatorio.`);
      }
    }

    const commRef = doc(db, 'communities', communityId);
    await updateDoc(commRef, {
      memberIds: arrayRemove(currentUser.id),
      memberCount: Math.max(0, memberCount - 1)
    });
    await updateDoc(doc(db, 'users', currentUser.id), {
      joinedCommunityIds: arrayRemove(communityId)
    });
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

  return (
    <AppContext.Provider value={{ currentUser, isAuthenticated, isLoading, profileLoaded, login, register, loginWithGoogle, logout, posts, users, communities, comments, messages, messageRequests, notifications, addPost, addComment, updatePost, deletePost, toggleLike, toggleRepost, toggleHighlight, toggleFollow, updateProfile, addCommunity, deleteCommunity, sendMessage, sendMessageRequest, acceptMessageRequest, rejectMessageRequest, joinCommunity, leaveCommunity, isCreatePostOpen, setCreatePostOpen, createNotification, markNotificationRead }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
