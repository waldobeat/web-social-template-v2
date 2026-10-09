import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { ShedditUser } from '../types';

interface AuthContextType {
  user: ShedditUser | null;
  loading: boolean;
  createGuestUser: () => ShedditUser;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<ShedditUser, 'displayName' | 'bio' | 'avatar' | 'username'>>) => Promise<void>;
  registerWithEmailPassword: (email: string, password: string, displayName: string, recaptchaToken: string) => Promise<ShedditUser>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
