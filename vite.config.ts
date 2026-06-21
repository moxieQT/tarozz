import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // Strip console/debugger statements from the production bundle (and any deps).
    esbuild: isBuild ? { drop: ['console', 'debugger'] } : {},
    build: {
      // Modern baseline → less transpilation, smaller output.
      target: 'es2020',
      cssCodeSplit: true,
      // We already split heavy libs into their own cacheable chunks below.
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Split large, stable vendor libraries into separate long-term-cacheable
          // chunks so app updates don't bust the whole bundle and so heavy libs
          // (three.js) load only with the lazy routes that need them.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('three')) return 'three';
            if (
              id.includes('react-router') ||
              id.includes('react-dom') ||
              id.includes('/react/') ||
              id.includes('react/jsx-runtime') ||
              id.includes('scheduler')
            ) {
              return 'react-vendor';
            }
            if (id.includes('motion') || id.includes('framer')) return 'motion';
            if (id.includes('lucide-react')) return 'icons';
            // html2pdf stays in its own dynamic chunk (only loaded on PDF export).
            return undefined;
          },
        },
      },
    },
    server: {
      // Completely disable Hot Module Replacement to prevent WebSocket connection attempts
      hmr: false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
