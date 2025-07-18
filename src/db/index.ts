import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
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
import * as course from "./schema/course.db";
import * as contact from "./schema/contact.db";
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
  ...course,
  ...contact,
  ...jobApplication,
};

const getDatabaseUrl = () => {
  return config.database.url;
};

export type Database = NodePgDatabase<typeof schema>;

export const getDb = () => {
  const connectionUrl = getDatabaseUrl();
  const pool = new Pool({
    connectionString: connectionUrl,
  });

  return drizzle(pool, { schema });
};
