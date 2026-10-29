import { Router } from "express";
import {
  getMyProfile,
  getPendingOrganizationsHandler,
  verifyOrganizationHandler,
  rejectOrganizationHandler,
  suspendUserAccountHandler,
  reactivateUserAccountHandler,
  getAllOrganizationsHandler,
  getAllUsersHandler,
  getAllAuditLogsHandler,
  createAuditLogHandler,
  updateAuditLogHandler,
  deleteAuditLogHandler,
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

router.get(
  "/organizations",
  protect,
  authorize("admin"),
  getAllOrganizationsHandler
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

router.get(
  "/users",
  protect,
  authorize("admin"),
  getAllUsersHandler
);

router.get(
  "/audit-logs",
  protect,
  authorize("admin"),
  getAllAuditLogsHandler
);

router.post(
  "/audit-logs",
  protect,
  authorize("admin"),
  createAuditLogHandler
);

router.patch(
  "/audit-logs/:id",
  protect,
  authorize("admin"),
  updateAuditLogHandler
);

router.delete(
  "/audit-logs/:id",
  protect,
  authorize("admin"),
  deleteAuditLogHandler
);

export default router;
