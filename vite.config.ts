import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'AUTH_', 'OLTS_', 'KRI_', 'NOTIFICATIONS_'],
  plugins: [react()],
})
