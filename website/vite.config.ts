import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5175,
    // Arena and other hosted previews use a generated e2b.app hostname.
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5175,
    allowedHosts: true,
  },
})
