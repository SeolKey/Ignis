// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:80',
      '/oauth2': 'http://localhost:80',
      '/logout': 'http://localhost:80',
      '/user': 'http://localhost:80', // 폼로그인 등 사용하는 경로면 추가
    },
  },
})
