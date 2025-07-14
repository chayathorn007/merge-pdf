// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // เพิ่มเพื่อให้ Docker container สามารถเข้าถึงได้
    port: 3000,
    proxy: {
      "/upload": "http://backend:3001", // ปรับให้ใช้ service name ของ Docker
      "/pdf": "http://backend:3001"
    }
  },
});
