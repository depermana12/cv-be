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

// routes with specific authentication (more specific patterns first)
// child routes for cv related sections (has own jwt middleware)
router.route("/cvs", cvChildRoutes);
// cvs for authenticated users (has own jwt middleware)
router.route("/cvs", cvRoutes);

// public routes (no auth required, less specific patterns last)
router.route("/auth", authRoutes);
// cvs for public access isPublic true (no auth)
router.route("/cvs", publicCvRoutes);

// protected routes (global jwt middleware)
router.use("*", jwt());
router.route("/users", userRoutes);
router.route("/applications-tracking", jobApplicationRoutes);
router.route("/uploads", uploadRoutes);
router.route("/analytics", analyticsRoutes);
router.route("/cover-letters", coverLetterRoutes);

export default router;
