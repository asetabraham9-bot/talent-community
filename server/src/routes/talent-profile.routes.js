
import { Router } from "express";
import {
  browseProfiles,
  getMyProfile,
  createMyProfile,
  updateMyProfile,
} from "../controllers/talent-profile.controller.js";
import {
  protect,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

// Public: browse all public talent profiles (no auth required)
router.get("/", browseProfiles);

// All routes below require authentication as a talent
router.use(protect, authorize("talent"));

router.get("/profile", getMyProfile);
router.post("/profile", createMyProfile);
router.patch("/profile", updateMyProfile);

export default router;
