import { Router } from "express";

import {
  createChallengeProjectHandler,
  getMyProjectsHandler,
  getProjectByIdHandler,
  updateMyProjectHandler,
  updateMyProjectStatusHandler,
  getProjectByChallengeHandler,
} from "../controllers/project.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// All project endpoints require authentication.
router.use(protect);

// Organization: create or retrieve the shared project for a challenge.
router.post(
  "/",
  authorize("organization"),
  createChallengeProjectHandler,
);

// Organization: list projects belonging to its organization.
router.get(
  "/my",
  authorize("organization"),
  getMyProjectsHandler,
);

// Organization: update project status.
router.patch(
  "/:id/status",
  authorize("organization"),
  updateMyProjectStatusHandler,
);

// Organization: update project details.
router.patch(
  "/:id",
  authorize("organization"),
  updateMyProjectHandler,
);

// Talent: retrieve a project by its challenge ID.
router.get(
  "/by-challenge/:challengeId",
  authorize("talent"),
  getProjectByChallengeHandler,
);

// Talent or organization: retrieve a project.
// The service enforces visibility and resource access.
router.get(
  "/:id",
  authorize("talent", "organization"),
  getProjectByIdHandler,
);

export default router;
