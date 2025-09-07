import { defineConfig } from 'vitest/config';

// biome-ignore lint/style/noDefaultExport: vite
export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.type.ts',
        'src/main.ts',
        'src/types',
        'src/tests/**/*',
        'src/temp',
        '**/index.ts',
      ],
    },
  },
});
