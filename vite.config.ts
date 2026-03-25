import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build optimization
  build: {
    // Target modern browsers
    target: 'esnext',

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase',
      'lucide-react',
    ],
  },

  // Server configuration
  server: {
    port: 5173,
    open: true,
  },

  // Preview configuration
  preview: {
    port: 4173,
  },
})
