import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// tlock-js expects Node-style `Buffer`/`global` to exist. Map `global` to
// `globalThis` and let the `buffer` package resolve in the browser bundle.
// (main.jsx also assigns globalThis.Buffer at runtime.)
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
});
