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
          // AI SDKs (Groq, Google, OpenAI)
          if (id.includes('node_modules/@google/generative-ai') ||
              id.includes('node_modules/groq-sdk') ||
              id.includes('node_modules/openai')) {
            return 'ai-vendor';
          }
          // Validation (Zod)
          if (id.includes('node_modules/zod')) {
            return 'validation-vendor';
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
          // MediaPipe and pose detection (ML libraries)
          if (id.includes('node_modules/@mediapipe/') ||
              id.includes('node_modules/@tensorflow/')) {
            return 'ml-vendor';
          }
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'router-vendor';
          }
          // Upstash Redis (rate limiting)
          if (id.includes('node_modules/@upstash/')) {
            return 'rate-limit-vendor';
          }
        },
      },
    },
    // Minify in production
    minify: mode === 'production' ? 'esbuild' : false,
    // Increase chunk size warning limit (Three.js is inherently large)
    chunkSizeWarningLimit: 600,
    // Target modern browsers for smaller bundle
    target: 'es2020',
  },
  // Only expose specific environment variables, not all of process.env
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  // Optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'framer-motion',
      'zod',
    ],
    // Exclude large libraries that are lazy loaded
    exclude: [
      '@mediapipe/pose',
      '@mediapipe/camera_utils',
    ],
  },
  // Faster HMR in development
  server: {
    hmr: {
      overlay: true,
    },
  },
}));
