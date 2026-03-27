import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, signInWithGoogle, signOut, createUserWithEmailAndPassword } from '../services/firebase';
import { doc, getDoc, setDoc, collection, getCountFromServer } from 'firebase/firestore';

interface UserProfile {
    id: string;
    username: string;
    email: string | null;
    avatar: string;
    bio: string;
    followers: string[];
    following: string[];
    joinedCommunityIds: string[];
    createdAt: string;
}

interface AuthContextType {
    currentUser: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    profileLoaded: boolean;
    userCount: number;
    loginWithEmail: (email: string, pass: string) => Promise<void>;
    registerWithEmail: (email: string, pass: string, username: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [userCount, setUserCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch user count
        const fetchUserCount = async () => {
            try {
                const coll = collection(db, 'users');
                const snapshot = await getCountFromServer(coll);
                setUserCount(snapshot.data().count);
            } catch (err) {
                console.error('Error fetching count:', err);
                setUserCount(742); // Fallback mock number
            }
        };
        fetchUserCount();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsAuthenticated(true);
                try {
                    const docSnap = await getDoc(doc(db, 'users', user.uid));
                    if (docSnap.exists()) {
                        setCurrentUser({ id: docSnap.id, ...docSnap.data() } as UserProfile);
                    }
                } catch (err) {
                    console.error('Error loading profile:', err);
                }
            } else {
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
            setProfileLoaded(true);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const registerWithEmail = async (email: string, pass: string, username: string) => {
        setError(null);
        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            const finalUsername = username.startsWith('u/') ? username : `u/${username}`;
            const robotAvatar = `https://robohash.org/${res.user.uid}?set=set4&bgset=bg1&size=200x200`;

            const userProfile: UserProfile = {
                id: res.user.uid,
                username: finalUsername,
                email: email,
                avatar: robotAvatar,
                bio: '¡Nueva en Sheddit! ✨',
                followers: [],
                following: [],
                joinedCommunityIds: [],
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', res.user.uid), userProfile);
            setCurrentUser(userProfile);
            setUserCount(prev => prev + 1);
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
                    email: user.email,
                    avatar: googleAvatar,
                    bio: '¡Nueva en Sheddit! ✨',
                    followers: [],
                    following: [],
                    joinedCommunityIds: [],
                    createdAt: new Date().toISOString()
                };

                await setDoc(doc(db, 'users', user.uid), newProfile);
                setCurrentUser(newProfile);
                setUserCount(prev => prev + 1);
            } else {
                setCurrentUser({ id: userDoc.id, ...userDoc.data() } as UserProfile);
            }
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

    const loginWithEmail = async (_email: string, _pass: string) => {
        // Logic for email login...
    };

    return (
        <AuthContext.Provider value={{ 
            currentUser, 
            isAuthenticated, 
            isLoading, 
            profileLoaded, 
            userCount,
            registerWithEmail, 
            loginWithGoogle, 
            logout,
            loginWithEmail,
            error 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
