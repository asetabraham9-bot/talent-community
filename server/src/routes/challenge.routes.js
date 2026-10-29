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

// Organization-only routes
router.post(
  "/",
  protect,
  authorize("organization"),
  createChallengeHandler
);

// Must be declared BEFORE /:id so Express doesn't treat "my" as an id param
router.get(
  "/my",
  protect,
  authorize("organization"),
  getMyChallengesHandler
);

router.get("/:id", getPublicChallengeHandler);

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
