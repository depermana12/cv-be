import { Hono } from "hono";

import { personalRoutes } from "../controllers/personal.controller";
import { languageRoutes } from "../controllers/language.controller";
import { educationRoutes } from "../controllers/education.controller";
import { workRoutes } from "../controllers/work.controller";
import { organizationRoutes } from "../controllers/organization.controller";
import { projectRoutes } from "../controllers/project.controller";
import { courseRoutes } from "../controllers/course.controller";
import { skillRoutes } from "../controllers/skill.controller";
import { softSkillRoutes } from "../controllers/soft-skill.controller";
import { cvRoutes } from "../controllers/cv.controller";

const router = new Hono();

router.route("/personal", personalRoutes);
router.route("/languages", languageRoutes);
router.route("/education", educationRoutes);
router.route("/work-experiences", workRoutes);
router.route("/organization-experiences", organizationRoutes);
router.route("/projects", projectRoutes);
router.route("/courses", courseRoutes);
router.route("/skills", skillRoutes);
router.route("/soft-skills", softSkillRoutes);
router.route("/cv", cvRoutes);

export default router;
