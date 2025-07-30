import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/user': {
        target: 'http://localhost:80', // 포트 생략하면 기본 80
        changeOrigin: true,
      },
    },
  },
});
