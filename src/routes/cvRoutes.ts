import { Hono } from "hono";

import { courseRoutes } from "../controllers/course.controller";
import { educationRoutes } from "../controllers/education.controller";
import { languageRoutes } from "../controllers/language.controller";
import { locationRoutes } from "../controllers/location.controller";
import { organizationRoutes } from "../controllers/organization.controller";
import { projectRoutes } from "../controllers/project.controller";
import { skillRoutes } from "../controllers/skill.controller";
import { softSkillRoutes } from "../controllers/soft-skill.controller";
import { workRoutes } from "../controllers/work.controller";
import { socialRoutes } from "../controllers/socialMedia.controller";
import { profileRoutes } from "../controllers/profile.controller";

const cvChildRoutes = new Hono();

cvChildRoutes.route("/", profileRoutes);
cvChildRoutes.route("/", locationRoutes);
cvChildRoutes.route("/", socialRoutes);
cvChildRoutes.route("/", languageRoutes);
cvChildRoutes.route("/", educationRoutes);
cvChildRoutes.route("/", workRoutes);
cvChildRoutes.route("/", organizationRoutes);
cvChildRoutes.route("/", projectRoutes);
cvChildRoutes.route("/", courseRoutes);
cvChildRoutes.route("/", skillRoutes);
cvChildRoutes.route("/", softSkillRoutes);

export default cvChildRoutes;
