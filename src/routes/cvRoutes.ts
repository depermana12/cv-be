import { Hono } from "hono";
import { jwt } from "../middlewares/auth";
import { verifiedEmail } from "../middlewares/verifiedEmail";

import { courseRoutes } from "../controllers/cvChildren/course.controller";
import { educationRoutes } from "../controllers/cvChildren/education.controller";
import { languageRoutes } from "../controllers/cvChildren/language.controller";
import { organizationRoutes } from "../controllers/cvChildren/organization.controller";
import { projectRoutes } from "../controllers/cvChildren/project.controller";
import { skillRoutes } from "../controllers/cvChildren/skill.controller";
import { workRoutes } from "../controllers/cvChildren/work.controller";
import { contactRoutes } from "../controllers/cvChildren/contact.controller";

const cvChildRoutes = new Hono();

cvChildRoutes.use("*", jwt());
cvChildRoutes.use("*", verifiedEmail);
cvChildRoutes.route("/", contactRoutes);
cvChildRoutes.route("/", educationRoutes);
cvChildRoutes.route("/", workRoutes);
cvChildRoutes.route("/", projectRoutes);
cvChildRoutes.route("/", organizationRoutes);
cvChildRoutes.route("/", courseRoutes);
cvChildRoutes.route("/", skillRoutes);
cvChildRoutes.route("/", languageRoutes);

export default cvChildRoutes;
