import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  // Use relative base './' by default so that built assets load correctly on:
  // - GitHub Pages (under /LANDSLIDE-DETECTOR/ or any subpath)
  // - Netlify (under / or any domain)
  // - Custom subpaths / local static servers
  // Allows overriding via VITE_BASE_PATH if explicitly specified
  const base = process.env.VITE_BASE_PATH || './';

  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
    },
  };
});
