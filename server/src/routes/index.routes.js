import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import talentProfileRoutes from "./talent-profile.routes.js";
import organizationProfileRoutes from "./organization-profile.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(talentProfileRoutes);
router.use(organizationProfileRoutes);
router.use("/admin", adminRoutes);

export default router;
