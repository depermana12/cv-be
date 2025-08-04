import { Hono } from "hono";

import { jwt } from "../middlewares/auth";
import { verifiedEmail } from "../middlewares/verifiedEmail";
import { userRoutes, userBasicRoutes } from "../controllers/user.controller";
import { uploadRoutes } from "../controllers/upload.controller";
import cvChildRoutes from "./cvRoutes";
import { cvRoutes, publicCvRoutes } from "../controllers/cv.controller";
import { authRoutes } from "../controllers/auth.controller";
import { jobApplicationRoutes } from "../controllers/jobApplication.controller";
import { analyticsRoutes } from "../controllers/analytics.controller";
import { coverLetterRoutes } from "../controllers/coverLetter.controller";

const router = new Hono();

// public routes (no auth required)
router.route("/auth", authRoutes);
router.route("/cvs", publicCvRoutes); // handles /cvs/public/* routes

// protected cv routes requiring authentication
// child routes for cv related sections (has own jwt middleware)
router.route("/cvs", cvChildRoutes);
// cvs for authenticated users (has own jwt middleware)
router.route("/cvs", cvRoutes);

// protected routes requiring authentication and email verification
router.use("*", jwt());
router.use("*", verifiedEmail);
router.route("/applications-tracking", jobApplicationRoutes);
router.route("/uploads", uploadRoutes);
router.route("/analytics", analyticsRoutes);
router.route("/cover-letters", coverLetterRoutes);

// user routes - basic routes (JWT only, no email verification required)
router.use("/users/*", jwt());
router.route("/users", userBasicRoutes);

// user routes - advanced routes (JWT + email verification required)
router.route("/users", userRoutes);

export default router;
