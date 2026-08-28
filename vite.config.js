import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Permet l'hébergement direct sur GitHub Pages et tout sous-dossier
  server: {
    port: 3000,
    open: false
  }
})
