import { Router } from "express";
import {
  getMyProfile,
  getPendingOrganizationsHandler,
  verifyOrganizationHandler,
  rejectOrganizationHandler,
  suspendUserAccountHandler,
  reactivateUserAccountHandler,
} from "../controllers/admin.controller.js";
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

router.get(
  "/organizations/pending",
  protect,
  authorize("admin"),
  getPendingOrganizationsHandler
);

router.patch(
  "/organizations/:id/verify",
  protect,
  authorize("admin"),
  verifyOrganizationHandler
);

router.patch(
  "/organizations/:id/reject",
  protect,
  authorize("admin"),
  rejectOrganizationHandler
);

router.patch(
  "/users/:id/suspend",
  protect,
  authorize("admin"),
  suspendUserAccountHandler
);

router.patch(
  "/users/:id/reactivate",
  protect,
  authorize("admin"),
  reactivateUserAccountHandler
);

export default router;
