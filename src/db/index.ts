import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";

import { users } from "./schema/user.db";
import * as personals from "./schema/personal.db";
import * as locations from "./schema/location.db";
import * as socials from "./schema/social.db";
import * as languages from "./schema/language.db";
import * as educations from "./schema/education.db";
import * as works from "./schema/work.db";
import * as organizations from "./schema/organization.db";
import * as projects from "./schema/project.db";
import * as skills from "./schema/skill.db";
import * as softSkills from "./schema/soft-skill.db";
import * as courses from "./schema/course.db";

const schema = {
  ...users,
  ...personals,
  ...locations,
  ...socials,
  ...languages,
  ...educations,
  ...works,
  ...organizations,
  ...projects,
  ...skills,
  ...softSkills,
  ...courses,
};

export const db = drizzle(process.env.DATABASE_URL!);
