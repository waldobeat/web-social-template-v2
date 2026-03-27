import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut, 
    createUserWithEmailAndPassword 
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    registerWithEmail: (email: string, pass: string, username: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const registerWithEmail = async (email: string, pass: string, username: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newUser = userCredential.user;
        
        await setDoc(doc(db, 'users', newUser.uid), {
            username: username.startsWith('u/') ? username : `u/${username}`,
            email: email,
            createdAt: new Date().toISOString(),
            isPremiumCandidate: true 
        });
    };

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const loggedUser = result.user;
        
        const userRef = doc(db, 'users', loggedUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            const baseName = loggedUser.displayName?.split(' ')[0].toLowerCase() || 'user';
            await setDoc(userRef, {
                username: `u/${baseName}_${Math.floor(Math.random() * 1000)}`,
                email: loggedUser.email,
                createdAt: new Date().toISOString(),
                isPremiumCandidate: true
            });
        }
    };

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, loading, registerWithEmail, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
