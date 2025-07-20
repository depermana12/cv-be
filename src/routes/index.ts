import { Hono } from "hono";

import { jwt } from "../middlewares/auth";
import { userRoutes } from "../controllers/user.controller";
import { uploadRoutes } from "../controllers/upload.controller";
import cvChildRoutes from "./cvRoutes";
import { cvRoutes, publicCvRoutes } from "../controllers/cv.controller";
import { authRoutes } from "../controllers/auth.controller";
import { jobApplicationRoutes } from "../controllers/jobApplication.controller";
import { analyticsRoutes } from "../controllers/analytics.controller";
import { coverLetterRoutes } from "../controllers/coverLetter.controller";

const router = new Hono();

// public routes
router.route("/auth", authRoutes);
// cvs for public access isPublic true
router.route("/cvs", publicCvRoutes);
// cvs for authenticated users
router.route("/cvs", cvRoutes);

// protected routes
router.use("*", jwt());
router.route("/users", userRoutes);
router.route("/applications-tracking", jobApplicationRoutes);
router.route("/uploads", uploadRoutes);
router.route("/analytics", analyticsRoutes);
router.route("/cover-letters", coverLetterRoutes);

// child routes for cv related sections
router.route("/cvs", cvChildRoutes);

export default router;
