import { Hono } from "hono";

import { courseRoutes } from "../controllers/course.controller";
import { educationRoutes } from "../controllers/education.controller";
import { languageRoutes } from "../controllers/language.controller";
import { organizationRoutes } from "../controllers/organization.controller";
import { projectRoutes } from "../controllers/project.controller";
import { skillRoutes } from "../controllers/skill.controller";
import { workRoutes } from "../controllers/work.controller";
import { contactRoutes } from "../controllers/contact.controller";

const cvChildRoutes = new Hono();

cvChildRoutes.route("/", contactRoutes);
cvChildRoutes.route("/", educationRoutes);
cvChildRoutes.route("/", workRoutes);
cvChildRoutes.route("/", projectRoutes);
cvChildRoutes.route("/", organizationRoutes);
cvChildRoutes.route("/", courseRoutes);
cvChildRoutes.route("/", skillRoutes);
cvChildRoutes.route("/", languageRoutes);

export default cvChildRoutes;
