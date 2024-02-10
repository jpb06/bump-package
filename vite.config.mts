import { defineConfig } from 'vitest/config';

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
        'src/tests-related/**/*',
      ],
    },
  },
});
