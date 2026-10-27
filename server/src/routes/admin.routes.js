
import { Router } from "express";
import { getMyProfile } from "../controllers/admin.controller.js";
import {
  protect,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/profile",
  protect,
  authorize("admin"),
  getMyProfile
);

export default router;
