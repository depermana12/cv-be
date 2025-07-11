import "dotenv/config";
import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { config } from "../config/index.js";

import * as user from "./schema/user.db";
import * as cv from "./schema/cv.db";
import * as profile from "./schema/profile.db";
import * as language from "./schema/language.db";
import * as education from "./schema/education.db";
import * as location from "./schema/location.db";
import * as social from "./schema/social.db";
import * as work from "./schema/work.db";
import * as organization from "./schema/organization.db";
import * as project from "./schema/project.db";
import * as skill from "./schema/skill.db";
import * as softSkill from "./schema/soft-skill.db";
import * as course from "./schema/course.db";
import * as jobApplication from "./schema/jobApplication.db";

export const schema = {
  ...user,
  ...cv,
  ...profile,
  ...language,
  ...education,
  ...location,
  ...social,
  ...work,
  ...organization,
  ...project,
  ...skill,
  ...softSkill,
  ...course,
  ...jobApplication,
};

const getDatabaseUrl = () => {
  return config.database.url;
};

/**
 * Singleton pool drizzle mysql with globalThis store
 * extending global object to add __drizzleDbInstance and __drizzlePool
 * This allows to reuse single database connection and db instance after the first call
 */
export type Database = MySql2Database<typeof schema>;

const globalAny = global as typeof globalThis & {
  __drizzleDbInstance?: Database;
  __drizzlePool?: mysql.Pool;
};

export const getDb = async () => {
  if (!globalAny.__drizzleDbInstance) {
    const connectionUrl = getDatabaseUrl();

    const pool = mysql.createPool({
      uri: connectionUrl,
      connectionLimit: 10,
      waitForConnections: true,
      idleTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    const db = drizzle(pool, {
      schema,
      mode: "default",
    });

    globalAny.__drizzlePool = pool;
    globalAny.__drizzleDbInstance = db;
  }

  return globalAny.__drizzleDbInstance;
};
