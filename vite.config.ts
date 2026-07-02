import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { buildVersionFromGit } from './scripts/build-version.mjs'

const BASE_URL = './';
const BUILD_VERSION = buildVersionFromGit(process.cwd());

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: BASE_URL,
  publicDir: 'public',
  define: {
    __BRICKBREAKER_BUILD_VERSION__: JSON.stringify(BUILD_VERSION),
  },
  server: {
    port: 7979,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});