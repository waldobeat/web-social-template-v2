import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize Firebase App Check (Security Layer 1)
import { initializeAppCheck } from './services/appCheck';
if (typeof window !== 'undefined') {
  initializeAppCheck();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
