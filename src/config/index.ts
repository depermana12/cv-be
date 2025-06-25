import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("5000"),

  // logger
  LOG_LEVEL: z.string().default("info"),

  // database
  DATABASE_URL: z.string(),
  TEST_DATABASE_URL: z.string().optional(),

  // jwt
  JWT_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),

  // email
  MAILTRAP_HOST: z.string().optional(),
  MAILTRAP_PORT: z.string().transform(Number).optional(),
  MAILTRAP_USER: z.string().optional(),
  MAILTRAP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  FROM_NAME: z.string().optional(),

  // urls
  APP_URL: z.string().url().optional(),
  FRONTEND_URL: z.string().url().optional(),

  // aws
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (err) {
  if (err instanceof z.ZodError) {
    console.error("Invalid environment variables:", err.flatten().fieldErrors);
  } else {
    console.error("Failed to parse environment variables:", err);
  }
  process.exit(1);
}

export const config = {
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  LOG_LEVEL: env.LOG_LEVEL,

  database: {
    url: env.NODE_ENV === "test" ? env.TEST_DATABASE_URL : env.DATABASE_URL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    expiresIn: "15m",
    refreshExpiresIn: "7d",
  },

  email: {
    host: env.MAILTRAP_HOST,
    port: env.MAILTRAP_PORT,
    user: env.MAILTRAP_USER,
    pass: env.MAILTRAP_PASS,
    from: env.FROM_EMAIL,
    fromName: env.FROM_NAME,
  },

  urls: {
    app: env.APP_URL || "http://localhost:5000",
    frontend: env.FRONTEND_URL || "http://localhost:5173",
  },

  aws: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
    s3Bucket: env.AWS_S3_BUCKET_NAME,
  },

  isTest: env.NODE_ENV === "test",
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
} as const;

export type Config = typeof config;
