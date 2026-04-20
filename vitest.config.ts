import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['api/**/*.test.ts', 'src/**/*.test.ts'],
    restoreMocks: true,
    unstubGlobals: true,
    clearMocks: true,
  },
})
