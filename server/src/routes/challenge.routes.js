import { Router } from "express";

import {
  createChallengeHandler,
  getMyChallengesHandler,
  browseChallengesHandler,
  getPublicChallengeHandler,
  updateChallengeHandler,
  updateChallengeStatusHandler,
} from "../controllers/challenge.controller.js";

import {
  protect,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", browseChallengesHandler);
router.get("/:id", getPublicChallengeHandler);

// Organization-only routes
router.post(
  "/",
  protect,
  authorize("organization"),
  createChallengeHandler
);

router.get(
  "/my",
  protect,
  authorize("organization"),
  getMyChallengesHandler
);

router.patch(
  "/:id",
  protect,
  authorize("organization"),
  updateChallengeHandler
);

router.patch(
  "/:id/status",
  protect,
  authorize("organization"),
  updateChallengeStatusHandler
);

export default router;
