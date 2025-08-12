import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "../config/index.js";

import * as user from "./schema/user.db";
import * as cv from "./schema/cv.db";
import * as contact from "./schema/contact.db.js";
import * as education from "./schema/education.db";
import * as work from "./schema/work.db";
import * as project from "./schema/project.db";
import * as organization from "./schema/organization.db";
import * as course from "./schema/course.db";
import * as skill from "./schema/skill.db";
import * as language from "./schema/language.db";
// import * as coverLetter from "./schema/coverLetter.db";
import * as jobApplication from "./schema/jobApplication.db";
import * as aiOptimization from "./schema/aiOptimization.db";

export const schema = {
  ...user,
  ...cv,
  ...contact,
  ...education,
  ...work,
  ...project,
  ...organization,
  ...course,
  ...skill,
  ...language,
  ...jobApplication,
  ...aiOptimization,
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
