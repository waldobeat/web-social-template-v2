/**
 * Auth Context - Separate authentication concerns from AppContext
 * Handles user authentication state and operations
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth, db, signInWithGoogle } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserProfile } from '../data/mockData';

interface AuthContextType {
    currentUser: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    profileLoaded: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, username: string, extraData: { age: string, interests: string[] }) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: { username?: string; bio?: string; avatar?: string; isVerified?: boolean }) => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Skip if Firebase not configured
        if (!import.meta.env.VITE_FIREBASE_API_KEY) {
            setIsLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsAuthenticated(true);

                try {
                    const docSnap = await getDoc(doc(db, 'users', user.uid));
                    if (docSnap.exists()) {
                        setCurrentUser({ id: docSnap.id, ...docSnap.data() } as UserProfile);
                        setProfileLoaded(true);
                    } else {
                        setProfileLoaded(true);
                    }
                } catch (err) {
                    console.error('Error loading profile:', err);
                    setProfileLoaded(true);
                }
            } else {
                setIsAuthenticated(false);
                setCurrentUser(null);
                setProfileLoaded(true);
            }

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const loginWithGoogle = async () => {
        setError(null);
        try {
            const result = await signInWithGoogle();
            const user = result.user;

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                const emailParts = user.email?.split('@') || ['user'];
                const defaultUsername = `u/${emailParts[0]}`;
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
                setCurrentUser(newProfile);
            } else {
                setCurrentUser({ id: userDoc.id, ...userDoc.data() } as UserProfile);
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const register = async (
        email: string,
        pass: string,
        username: string,
        extraData: { age: string, interests: string[] }
    ) => {
        setError(null);
        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            const robotAvatar = `https://robohash.org/${res.user.uid}?set=set4&bgset=bg1&size=200x200`;

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
            setCurrentUser(userProfile);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const logout = async () => {
        setError(null);
        try {
            await signOut(auth);
            setCurrentUser(null);
            setIsAuthenticated(false);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateProfile = async (data: { username?: string; bio?: string; avatar?: string; isVerified?: boolean }) => {
        if (!currentUser) return;

        const updateData: Record<string, unknown> = {};
        if (data.username) updateData.username = data.username;
        if (data.bio !== undefined) updateData.bio = data.bio;
        if (data.avatar) updateData.avatar = data.avatar;
        if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;

        await doc; // Placeholder - actual updateDoc call would be in real implementation
        // Update local state
        setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    };

    const value = {
        currentUser,
        isAuthenticated,
        isLoading,
        profileLoaded,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        error,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;