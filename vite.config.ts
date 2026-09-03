import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  base: '/ghostboard/',   // <-- adding this, matching the repo name exactly
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
