import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'AUTH_', 'OLTS_', 'KRI_', 'NOTIFICATIONS_', 'RISK_REGISTER_', 'SELF_ASSESSMENT_', 'PROCESS_FLOWS_', 'DASHBOARD_'],
  plugins: [react()],
})
