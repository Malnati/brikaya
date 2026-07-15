import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildVersionFromGit } from './scripts/build-version.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = '/';
const BUILD_VERSION = buildVersionFromGit(process.cwd());

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: BASE_URL,
  publicDir: 'public',
  define: {
    __BRIKAYA_BUILD_VERSION__: JSON.stringify(BUILD_VERSION),
  },
  server: {
    port: 7979,
    strictPort: true,
  },
  preview: {
    port: 7979,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'play/index.html'),
      },
      output: {
        manualChunks: undefined,
      },
    },
  },
});
