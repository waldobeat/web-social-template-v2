import { useState, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { ref, get, set, serverTimestamp } from 'firebase/database';
import { auth, db } from '../lib/firebase';
import type { ShedditUser } from '../types';

export type { ShedditUser };

const GUEST_AVATARS = ['🦁', '🐯', '🦊', '🐺', '🦅', '🐬', '🦋', '🌵', '🔥', '⚡', '🎭', '🧠'];

export function useAuth() {
  const [user, setUser] = useState<ShedditUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore guest session from sessionStorage
    const guestData = sessionStorage.getItem('sheddit_guest');
    if (guestData) {
      try {
        setUser(JSON.parse(guestData));
        setLoading(false);
      } catch {
        sessionStorage.removeItem('sheddit_guest');
      }
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        sessionStorage.removeItem('sheddit_guest');
        const userRef = ref(db, `users/${fbUser.uid}`);
        const snap = await get(userRef);
        if (snap.exists()) {
          const data = snap.val();
          setUser({
            uid: fbUser.uid,
            displayName: data.displayName || fbUser.displayName || 'Usuario',
            username: data.username || fbUser.email?.split('@')[0] || 'user',
            bio: data.bio || '',
            avatar: data.avatar || '🦁',
            photoURL: fbUser.photoURL || undefined,
            isGuest: false,
            followersCount: data.followersCount || 0,
            followingCount: data.followingCount || 0,
            postsCount: data.postsCount || 0,
            createdAt: data.createdAt || Date.now(),
          });
        } else {
          // First-time Google user — create profile
          const newUser: ShedditUser = {
            uid: fbUser.uid,
            displayName: fbUser.displayName || 'Nuevo Usuario',
            username: (fbUser.email?.split('@')[0] || 'user') + Math.floor(Math.random() * 999),
            bio: '',
            avatar: GUEST_AVATARS[Math.floor(Math.random() * GUEST_AVATARS.length)],
            photoURL: fbUser.photoURL || undefined,
            isGuest: false,
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            createdAt: Date.now(),
          };
          await set(userRef, { ...newUser, createdAt: serverTimestamp() });
          setUser(newUser);
        }
      } else if (!sessionStorage.getItem('sheddit_guest')) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const createGuestUser = (): ShedditUser => {
    const guestId = 'guest_' + Date.now();
    const guestUser: ShedditUser = {
      uid: guestId,
      displayName: 'Invitado',
      username: 'invitado_' + Math.floor(Math.random() * 9999),
      bio: '',
      avatar: GUEST_AVATARS[Math.floor(Math.random() * GUEST_AVATARS.length)],
      isGuest: true,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: Date.now(),
    };
    sessionStorage.setItem('sheddit_guest', JSON.stringify(guestUser));
    sessionStorage.setItem('sheddit_role', 'user');
    setUser(guestUser);
    return guestUser;
  };

  const logout = async () => {
    sessionStorage.removeItem('sheddit_guest');
    sessionStorage.removeItem('sheddit_role');
    if (firebaseUser) await auth.signOut();
    setUser(null);
    setFirebaseUser(null);
  };

  const updateProfile = async (
    updates: Partial<Pick<ShedditUser, 'displayName' | 'bio' | 'avatar' | 'username'>>
  ) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    if (user.isGuest) {
      sessionStorage.setItem('sheddit_guest', JSON.stringify(updated));
    } else {
      await set(ref(db, `users/${user.uid}`), updated);
    }
    setUser(updated);
  };

  const registerWithEmailPassword = async (email: string, password: string, displayName: string, recaptchaToken: string) => {
    // Verify reCAPTCHA token (in production, verify on backend)
    if (!recaptchaToken) {
      throw new Error('Por favor completa el reCAPTCHA');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    // Create user profile in database
    const newUser: ShedditUser = {
      uid: fbUser.uid,
      displayName: displayName.trim() || 'Nuevo Usuario',
      username: (email.split('@')[0] || 'user') + Math.floor(Math.random() * 999),
      bio: '',
      avatar: GUEST_AVATARS[Math.floor(Math.random() * GUEST_AVATARS.length)],
      photoURL: fbUser.photoURL || undefined,
      isGuest: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: Date.now(),
    };

    await set(ref(db, `users/${fbUser.uid}`), { ...newUser, createdAt: serverTimestamp() });
    sessionStorage.removeItem('sheddit_guest');
    setUser(newUser);

    return newUser;
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // The onAuthStateChanged listener will handle the rest
    return userCredential.user;
  };

  return { user, firebaseUser, loading, createGuestUser, logout, updateProfile, registerWithEmailPassword, loginWithEmailPassword };
}
