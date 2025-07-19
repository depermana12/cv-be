import "dotenv/config";
import "./xpolyfill";
import { defineConfig } from "drizzle-kit";
import { config } from "./src/config/index";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/",
  dialect: "postgresql",
  dbCredentials: {
    url: config.database.url!,
  },
});
