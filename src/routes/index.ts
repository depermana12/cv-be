import { Hono } from "hono";
import {
  personalRoutes,
  languageRoutes,
  educationRoutes,
  workExpRoutes,
  orgExpRoutes,
  projectRoutes,
  courseRoutes,
  skillRoutes,
  softSkillRoutes,
  cvRoutes,
} from "../controllers/controllers";

const router = new Hono();

router.route("/personal", personalRoutes);
router.route("/languages", languageRoutes);
router.route("/education", educationRoutes);
router.route("/work-experiences", workExpRoutes);
router.route("/organization-experiences", orgExpRoutes);
router.route("/projects", projectRoutes);
router.route("/courses", courseRoutes);
router.route("/skills", skillRoutes);
router.route("/soft-skills", softSkillRoutes);
router.route("/cv", cvRoutes);

export default router;
