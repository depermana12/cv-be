import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
// import mysql from "mysql2/promise";

// pool make the db hang
// export async function initializeDb() {
//   const pool = mysql.createPool({
//     uri: process.env.DATABASE_URL,
//     connectionLimit: 10,
//   });
// }

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

// export const createDb = async () => {
//   const client = await mysql.createConnection({
//     uri: process.env.DATABASE_URL,
//   });
//   return drizzle(client, {
//     schema,
//     mode: "default",
//   });
// };

export const db = drizzle(process.env.DATABASE_URL!, {
  schema,
  mode: "default",
});
