import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCmGnAyUo0tpi2sWziYMGnDaidIa7cDSc8",
  authDomain: "peliculas-f9888.firebaseapp.com",
  databaseURL: "https://peliculas-f9888-default-rtdb.firebaseio.com",
  projectId: "peliculas-f9888",
  storageBucket: "peliculas-f9888.firebasestorage.app",
  messagingSenderId: "725897510112",
  appId: "1:725897510112:web:953e240c35e1220de82485",
  measurementId: "G-NK68DKHBFV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// reCAPTCHA configuration for email/password auth
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
