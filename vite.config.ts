import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BASE_URL = './';

// https://vitejs.dev/config/
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
