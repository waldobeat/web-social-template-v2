import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCmGnAyUo0tpi2sWziYMGnDaidIa7cDSc8",
  authDomain: "peliculas-f9888.firebaseapp.com",
  projectId: "peliculas-f9888",
  storageBucket: "peliculas-f9888.firebasestorage.app",
  messagingSenderId: "725897510112",
  appId: "1:725897510112:web:953e240c35e1220de82485",
  measurementId: "G-NK68DKHBFV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
