import { Hono } from "hono";
import {
  personalRoutes,
  educationRoutes,
  workExpRoutes,
  orgExpRoutes,
  projectRoutes,
  courseRoutes,
} from "../controllers/controllers";

const router = new Hono();

router.route("/personal", personalRoutes);
router.route("/education", educationRoutes);
router.route("/work-experiences", workExpRoutes);
router.route("/organization-experiences", orgExpRoutes);
router.route("/projects", projectRoutes);
router.route("/courses", courseRoutes);

export default router;
