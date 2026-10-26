
import { Router } from "express";
import {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
} from "../controllers/talent-profile.controller.js";
import {
  protect,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, authorize("talent"));

router.get("/talent/profile", getMyProfile);
router.post("/talent/profile", createMyProfile);
router.patch("/talent/profile", updateMyProfile);

export default router;
