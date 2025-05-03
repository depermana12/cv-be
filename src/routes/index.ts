import { Hono } from "hono";

import { userRoutes } from "../controllers/user.controller";
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
import { socialRoutes } from "../controllers/social.controller";
import { locationRoutes } from "../controllers/location.controller";
import { jwt } from "../middlewares/auth";
import { uploadRoutes } from "../controllers/upload.controller";

const router = new Hono();

router.route("/auth", userRoutes);
router.use("*", jwt());
router.route("/cv/uploads", uploadRoutes);
router.route("/cv/personals", personalRoutes);
router.route("/cv/locations", locationRoutes);
router.route("/cv/socials", socialRoutes);
router.route("/cv/languages", languageRoutes);
router.route("/cv/education", educationRoutes);
router.route("/cv/works", workRoutes);
router.route("/cv/organizations", organizationRoutes);
router.route("/cv/projects", projectRoutes);
router.route("/cv/courses", courseRoutes);
router.route("/cv/skills", skillRoutes);
router.route("/cv/soft-skills", softSkillRoutes);
router.route("/cv/cvs", cvRoutes);

export default router;
