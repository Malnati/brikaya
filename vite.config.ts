// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BASE_URL = './';

export default defineConfig({
  plugins: [react()],
  base: BASE_URL,
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});