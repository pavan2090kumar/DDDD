import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  },
  optimizeDeps: {
    include: [
      '@tensorflow/tfjs', 
      '@tensorflow/tfjs-backend-webgl',
      '@tensorflow-models/face-landmarks-detection',
      '@mediapipe/face_mesh'
    ]
  },
  define: {
    global: 'globalThis',
  }
})