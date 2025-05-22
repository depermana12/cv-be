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

const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === "test") {
    return (
      process.env.TEST_DATABASE_URL || "mysql://root:root@localhost:3306/testdb"
    );
  }
  if (!process.env.DATABASE_URL) {
    throw new Error(`
      DATABASE_URL is not defined. Please configure it for ${process.env.NODE_ENV} environment.
      For tests, you can set TEST_DATABASE_URL or it will use the default test connection.
    `);
  }
  return process.env.DATABASE_URL;
};

export const getDb = async () => {
  const client = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
  });
  return drizzle(client, {
    schema,
    mode: "default",
  });

  // const globalAny = global as typeof globalThis & {
  //   __drizzleDbInstance?: ReturnType<typeof drizzle>;
  //   __drizzlePool?: mysql.Pool;
  // };

  // if (!globalAny.__drizzleDbInstance) {
  //   const connectionUrl = getDatabaseUrl();
  //   const pool = mysql.createPool({
  //     uri: connectionUrl,
  //     connectionLimit: 10,
  //     waitForConnections: true,
  //     idleTimeout: 60000,
  //     enableKeepAlive: true,
  //     keepAliveInitialDelay: 0,
  //   });

  //   globalAny.__drizzlePool = pool;
  //   globalAny.__drizzleDbInstance = drizzle(pool, { schema, mode: "default" });
  // }

  // return globalAny.__drizzleDbInstance;
};

// // Cleanup function
// if (process.env.NODE_ENV === "development") {
//   process.on("beforeExit", async () => {
//     const globalAny = global as typeof globalThis & {
//       __drizzlePool?: mysql.Pool;
//     };

//     if (globalAny.__drizzlePool) {
//       await globalAny.__drizzlePool.end();
//       console.log("Database pool closed");
//     }
//   });
// }

// export const db = drizzle(process.env.DATABASE_URL!, {
//   schema,
//   mode: "default",
// });
