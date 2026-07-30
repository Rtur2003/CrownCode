import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // three/drei/fiber tek parcada 1.17 MB'a cikiyordu. Vendor ayrimi:
        // uygulama kodu degisince agir kutuphaneler onbellekte kalir.
        manualChunks(id) {
          if (!id.includes('node_modules')) {return}
          if (/[\\/](three|@react-three)[\\/]/.test(id)) {return 'vendor-three'}
          if (/[\\/](gsap|@gsap|lenis)[\\/]/.test(id)) {return 'vendor-motion'}
          return 'vendor-react'
        },
      },
    },
  },
})
