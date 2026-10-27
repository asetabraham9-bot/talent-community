
import { Router } from "express";

import {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
} from "../controllers/organization-profile.controller.js";

import {
  protect,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, authorize("organization"));

router.get("/profile", getMyProfile);
router.post("/profile", createMyProfile);
router.patch("/profile", updateMyProfile);

export default router;
