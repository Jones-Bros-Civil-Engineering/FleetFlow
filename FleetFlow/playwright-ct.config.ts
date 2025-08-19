import { defineConfig } from '@playwright/experimental-ct-react'

export default defineConfig({
  testDir: './src/pages/__tests__',
  testMatch: /.*\.pwtest\.tsx/,
  snapshotDir: './src/pages/__tests__/__snapshots__',
  use: {
    viewport: { width: 1280, height: 720 },
  },
  ctViteConfig: {
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    },
  },
})
