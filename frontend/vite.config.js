import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow access from network devices
    host: '0.0.0.0',
    port: 5173,
    strictPort: false // Use next available port if 5173 is busy
  }
})
