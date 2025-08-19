import { config } from "dotenv";
import { resolve } from "path";

// Load test environment variables first
config({ path: resolve(process.cwd(), ".env.test") });

// Force test environment and database URL
process.env.NODE_ENV = "test";
process.env.TEST_DATABASE_URL =
  "postgresql://test_user:test_password@localhost:5433/cv_test";

// Global test setup
console.log("Test environment loaded");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("TEST_DATABASE_URL:", process.env.TEST_DATABASE_URL);
