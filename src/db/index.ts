import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as user from "./schema/user.db";
import * as personal from "./schema/personal.db";
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

export const schema = {
  ...user,
  ...personal,
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
};

export const getDb = async () => {
  // const client = await mysql.createConnection({
  //   uri: process.env.DATABASE_URL,
  // });
  // return drizzle(client, {
  //   schema,
  //   mode: "default",
  // });

  const globalAny = global as typeof globalThis & {
    __drizzleDbInstance?: ReturnType<typeof drizzle>;
    __drizzlePool?: mysql.Pool;
  };

  if (!globalAny.__drizzleDbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    const pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: 5,
      waitForConnections: true,
      idleTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    globalAny.__drizzlePool = pool;
    globalAny.__drizzleDbInstance = drizzle(pool, { schema, mode: "default" });
  }

  return globalAny.__drizzleDbInstance;
};

// export const db = drizzle(process.env.DATABASE_URL!, {
//   schema,
//   mode: "default",
// });
