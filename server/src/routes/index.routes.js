
import { Router } from "express";

import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import talentProfileRoutes from "./talent-profile.routes.js";
import organizationProfileRoutes from "./organization-profile.routes.js";
import adminRoutes from "./admin.routes.js";
import challengeRoutes from "./challenge.routes.js";
import applicationRoutes from "./application.routes.js";
import projectRoutes from "./project.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/talent", talentProfileRoutes);
router.use("/organization", organizationProfileRoutes);
router.use("/admin", adminRoutes);
router.use("/challenges", challengeRoutes);
router.use("/applications", applicationRoutes);
router.use("/projects", projectRoutes);

export default router;
