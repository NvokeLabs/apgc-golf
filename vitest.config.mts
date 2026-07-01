import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    // Integration tests each boot Payload, which runs dev schema-push against
    // the single local Postgres. Running files in parallel races on DDL
    // (Postgres error 42704). Serialize file execution to keep pushes ordered.
    fileParallelism: false,
  },
})
