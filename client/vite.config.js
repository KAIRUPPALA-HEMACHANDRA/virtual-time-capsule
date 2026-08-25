import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite Configuration
// The proxy setting is KEY - it solves the biggest headache in full-stack development:
// 
// Your React app runs on http://localhost:5173
// Your Express backend runs on http://localhost:5000
// Without the proxy, the browser blocks requests between them (CORS issues)
//
// With this proxy, when your React code calls fetch('/api/capsules'),
// Vite intercepts it and forwards it to http://localhost:5000/api/capsules
// The browser thinks it's talking to the same server - no CORS problems!

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
