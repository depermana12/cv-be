import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Force test environment
process.env.NODE_ENV = "test";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://test_user:test_password@localhost:5433/cv_test",
  },
});
