import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Famehub-Hiring-platform/',  // GitHub Pages subpath
  server: {
    port: 5173,
    host: true,
    // Proxy all /api requests to the Spring Boot backend
    // This eliminates CORS issues entirely in development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          charts: ['recharts'],
          editor: ['@monaco-editor/react'],
        }
      }
    }
  }
})

