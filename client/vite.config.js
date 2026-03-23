import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Ensure manualChunks always returns a value for node_modules 
        // to avoid "Invalid Type" errors in newer Vite/Rollup versions
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('socket.io-client')) return 'vendor-socket';
            if (id.includes('lucide-react')) return 'vendor-icons';
            
            // This captures all other dependencies into a generic vendor chunk
            return 'vendor';
          }
          // Returning nothing for local project files (src/*) 
          // lets Vite handle them with default bundling logic.
        },
      },
    },
  },
})
