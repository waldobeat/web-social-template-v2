/**
 * useAppContext - Backward compatibility hook
 * Combines Auth, Data, and UI contexts into single interface
 * This maintains compatibility with existing components while using the new context split
 */
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { useUI } from './UIContext';
import type { UserProfile, Post, Community, Comment, Message, AppNotification, MessageRequest } from '../data/mockData';

interface AppContextState {
    // From Auth
    currentUser: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    profileLoaded: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, username: string, extraData: { age: string, interests: string[] }) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: { username?: string; bio?: string; avatar?: string; isVerified?: boolean }) => Promise<void>;

    // From Data
    posts: Record<string, Post>;
    users: Record<string, UserProfile>;
    communities: Record<string, Community>;
    comments: Record<string, Comment>;
    messages: Record<string, Message[]>;
    messageRequests: Record<string, MessageRequest>;
    notifications: Record<string, AppNotification>;
    addPost: (content: string, communityId?: string, category?: string) => Promise<void>;
    addComment: (text: string, parentId: string) => Promise<void>;
    updatePost: (postId: string, newContent: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    toggleLike: (postId: string) => Promise<void>;
    toggleRepost: (postId: string, targetCommunityId?: string) => Promise<void>;
    toggleHighlight: (postId: string) => Promise<void>;
    toggleFollow: (userId: string) => Promise<void>;
    joinCommunity: (communityId: string) => Promise<void>;
    leaveCommunity: (communityId: string) => Promise<void>;
    addCommunity: (community: Omit<Community, 'id'>) => Promise<string | null>;
    deleteCommunity: (communityId: string) => Promise<void>;
    sendMessage: (toId: string, text: string) => Promise<void>;
    sendMessageRequest: (toId: string, message: string) => Promise<void>;
    acceptMessageRequest: (requestId: string) => Promise<void>;
    rejectMessageRequest: (requestId: string) => Promise<void>;
    markNotificationRead: (id: string) => Promise<void>;

    // From UI
    isCreatePostOpen: boolean;
    setCreatePostOpen: (open: boolean) => void;
}

/**
 * Combined hook for backward compatibility
 * Provides unified interface to all context data
 */
export const useAppContext = (): AppContextState => {
    const auth = useAuth();
    const data = useData();
    const ui = useUI();

    // Combine all contexts into single interface
    return {
        // Auth
        currentUser: auth.currentUser,
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        profileLoaded: auth.profileLoaded,
        login: auth.login,
        register: auth.register,
        loginWithGoogle: auth.loginWithGoogle,
        logout: auth.logout,
        updateProfile: auth.updateProfile,

        // Data (cast users to correct type)
        posts: data.posts,
        users: data.users as Record<string, UserProfile>,
        communities: data.communities,
        comments: data.comments,
        messages: data.messages,
        messageRequests: data.messageRequests,
        notifications: data.notifications,
        addPost: data.addPost,
        addComment: data.addComment,
        updatePost: data.updatePost,
        deletePost: data.deletePost,
        toggleLike: data.toggleLike,
        toggleRepost: data.toggleRepost,
        toggleHighlight: data.toggleHighlight,
        toggleFollow: async (_userId: string) => {
            // Toggle follow logic would go here
            console.log('toggleFollow not implemented in new context');
        },
        joinCommunity: data.joinCommunity,
        leaveCommunity: data.leaveCommunity,
        addCommunity: data.addCommunity,
        deleteCommunity: async (_communityId: string) => {
            // Delete community logic would go here
            console.log('deleteCommunity not implemented in new context');
        },
        sendMessage: data.sendMessage,
        sendMessageRequest: data.sendMessageRequest,
        acceptMessageRequest: data.acceptMessageRequest,
        rejectMessageRequest: data.rejectMessageRequest,
        markNotificationRead: data.markNotificationRead,

        // UI
        isCreatePostOpen: ui.isCreatePostOpen,
        setCreatePostOpen: ui.setCreatePostOpen,
    };
};

export default useAppContext;