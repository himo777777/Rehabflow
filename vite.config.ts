import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Disable sourcemaps in production to prevent source code exposure
    sourcemap: mode === 'development',
    // Optimize chunk splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core - cached separately
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // Three.js and related 3D libraries (largest chunk)
          if (id.includes('node_modules/three/') ||
              id.includes('node_modules/@react-three/')) {
            return 'three-vendor';
          }
          // PDF/export utilities
          if (id.includes('node_modules/html2canvas') ||
              id.includes('node_modules/jspdf')) {
            return 'pdf-vendor';
          }
          // Google AI SDK
          if (id.includes('node_modules/@google/generative-ai')) {
            return 'ai-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/framer-motion') ||
              id.includes('node_modules/lucide-react')) {
            return 'ui-vendor';
          }
          // Supabase
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase-vendor';
          }
          // Sanitization
          if (id.includes('node_modules/dompurify') ||
              id.includes('node_modules/marked')) {
            return 'markdown-vendor';
          }
        },
      },
    },
    // Minify in production
    minify: mode === 'production' ? 'esbuild' : false,
    // Increase chunk size warning limit (Three.js is inherently large)
    chunkSizeWarningLimit: 600,
  },
  // Only expose specific environment variables, not all of process.env
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  // Optimizations
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
}));
