import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.join(__dirname, 'src/renderer'),
  base: './',
  build: {
    outDir: path.join(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    sourcemap: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src/renderer'),
    },
  },
  server: {
    port: 5173,
  },
  css: {
    postcss: './postcss.config.js',
  },
});
