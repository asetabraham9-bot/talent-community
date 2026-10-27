
import { Router } from "express";

import {
  submitApplicationHandler,
  getMyApplicationsHandler,
  getChallengeApplicationsHandler,
  getApplicationByIdHandler,
  withdrawApplicationHandler,
  reviewApplicationHandler,
} from "../controllers/application.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// All application endpoints require authentication.
router.use(protect);

// Talent: submit an application.
router.post(
  "/",
  authorize("talent"),
  submitApplicationHandler,
);

// Talent: view their own applications.
// Keep this route before "/:id".
router.get(
  "/my",
  authorize("talent"),
  getMyApplicationsHandler,
);

// Organization: view applications for one of its challenges.
router.get(
  "/challenge/:challengeId",
  authorize("organization"),
  getChallengeApplicationsHandler,
);

// Talent: withdraw an application.
router.patch(
  "/:id/withdraw",
  authorize("talent"),
  withdrawApplicationHandler,
);

// Organization: review an application.
router.patch(
  "/:id/status",
  authorize("organization"),
  reviewApplicationHandler,
);

// Talent or organization: retrieve an application.
// The service must enforce ownership and access permissions.
router.get(
  "/:id",
  authorize("talent", "organization"),
  getApplicationByIdHandler,
);

export default router;
