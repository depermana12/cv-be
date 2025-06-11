import { Hono } from "hono";

import { courseRoutes } from "../controllers/course.controller";
import { educationRoutes } from "../controllers/education.controller";
import { languageRoutes } from "../controllers/language.controller";
import { locationRoutes } from "../controllers/location.controller";
import { organizationRoutes } from "../controllers/organization.controller";
import { personalRoutes } from "../controllers/personal.controller";
import { projectRoutes } from "../controllers/project.controller";
import { skillRoutes } from "../controllers/skill.controller";
import { socialRoutes } from "../controllers/social.controller";
import { softSkillRoutes } from "../controllers/soft-skill.controller";
import { workRoutes } from "../controllers/work.controller";

const cvChildRoutes = new Hono();

cvChildRoutes.route("/:cvId/personals", personalRoutes);
cvChildRoutes.route("/:cvId/locations", locationRoutes);
cvChildRoutes.route("/:cvId/socials", socialRoutes);
cvChildRoutes.route("/:cvId/languages", languageRoutes);
cvChildRoutes.route("/:cvId/education", educationRoutes);
cvChildRoutes.route("/:cvId/works", workRoutes);
cvChildRoutes.route("/:cvId/organizations", organizationRoutes);
cvChildRoutes.route("/:cvId/projects", projectRoutes);
cvChildRoutes.route("/:cvId/courses", courseRoutes);
cvChildRoutes.route("/:cvId/skills", skillRoutes);
cvChildRoutes.route("/:cvId/soft-skills", softSkillRoutes);

export default cvChildRoutes;
