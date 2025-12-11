import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // --- NEW PART START ---
  server: {
    host: true, // This tells Vite: "Listen on all IP addresses" (0.0.0.0)
    port: 5173, // Optional: Force the port number
  },
  // --- NEW PART END ---
})