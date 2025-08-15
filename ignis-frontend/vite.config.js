// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api':      { target: 'http://localhost:80', changeOrigin: true },
      '/user':     { target: 'http://localhost:80', changeOrigin: true },
      '/login':    { target: 'http://localhost:80', changeOrigin: true },
      '/oauth2':   { target: 'http://localhost:80', changeOrigin: true },
      '/logout':   { target: 'http://localhost:80', changeOrigin: true },
      '/donation': { target: 'http://localhost:80', changeOrigin: true },
      '/comment':  { target: 'http://localhost:80', changeOrigin: true },
      '/notice': { target: 'http://localhost:80', changeOrigin: true },
      '/post': { target: 'http://localhost:80', changeOrigin: true },
      '/funding': { target: 'http://localhost:80', changeOrigin: true },
    },
  },
})
