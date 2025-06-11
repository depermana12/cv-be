import { Hono } from "hono";

import { jwt } from "../middlewares/auth";
import { userRoutes } from "../controllers/user.controller";
import { uploadRoutes } from "../controllers/upload.controller";
import cvChildRoutes from "./cvRoutes";
import { cvRoutes } from "../controllers/cv.controller";
import { authRoutes } from "../controllers/auth.controller";

const router = new Hono();

// public routes
router.route("/auth", authRoutes);

// protected routes
router.use("*", jwt());
router.route("/users", userRoutes);
router.route("/uploads", uploadRoutes);

// main cv crud routes
router.route("/cvs", cvRoutes);
// child routes for cv related sections
router.route("/cvs", cvChildRoutes);

export default router;
