import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  root: __dirname,
  plugins: [
    nxViteTsPaths(),
    angular({
      tsconfig: 'apps/academic-hub/tsconfig.spec.json',
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['apps/academic-hub/**/*.spec.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
    coverage: {
      provider: 'v8',
      reporter: ['html', 'lcov'],
      reportsDirectory: 'coverage/apps/academic-hub',
    },
    setupFiles: ['apps/academic-hub/src/test-setup.ts'],
    deps: {
      inline: [/@angular\//, 'primeng', '@primeuix/themes'],
    },
  },
  resolve: {
    alias: {
      '@academic-hub/shared-models': '/shared-models/src/index.ts',
      '@academic-hub/data-access': '/data-access/src/index.ts',
      '@academic-hub/ui': '/ui/src/index.ts',
    },
  },
});