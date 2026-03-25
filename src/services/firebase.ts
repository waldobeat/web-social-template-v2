import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate configuration
const requiredKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
if (missingKeys.length > 0) {
  const errorMsg = `⚠️ Firebase configuration missing keys: ${missingKeys.join(', ')}. Please set them in your deployment environment (Vercel).`;
  console.error(errorMsg);
  if (typeof window !== 'undefined') {
    // Optional: alert the developer in the console with more details
    console.warn('See .env.example for required variables.');
  }
}

let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
}
 catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  // Create a dummy app object to avoid crashing other services immediately, 
  // but the app should ideally show a fallback UI.
  app = { name: '[DEFAULT]', options: {}, automaticDataCollectionEnabled: false } as any;
}

export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Helper functions for Google Sign-In
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signUpWithGoogle = () => signInWithPopup(auth, googleProvider);

// Export individual auth functions
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
