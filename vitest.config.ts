import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts", "./tests/setup-test-env.ts"],
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    exclude: ["node_modules/**", "dist/**"],
    testTimeout: 60000, // Increase timeout for database tests
    hookTimeout: 60000, // Increase hook timeout for database setup
    // Run integration tests sequentially to avoid database conflicts
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/types/**",
        "src/db/schema/**",
        "src/schemas/**",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
