import { 
  findUserById, 
  updateUserById,
  findUsers,
  countUsers,
} from "../repositories/user.repository.js";
import mongoose from "mongoose";
import {
  findOrganizationProfiles,
  countOrganizationProfiles,
  findOrganizationProfileById,
  updateOrganizationProfileById,
} from "../repositories/organization-profile.repository.js";
import { 
  createAuditLog,
  findAuditLogs,
  countAuditLogs,
  findAuditLogById,
  updateAuditLogById,
  deleteAuditLogById,
} from "../repositories/audit-log.repository.js";

export const getAdminProfile = async (userId) => {
  const user = await findUserById(userId);

  if (!user || user.role !== "admin" || user.status !== "active") {
    const error = new Error("Admin account not found or unavailable.");
    error.status = 404;
    throw error;
  }

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getPendingOrganizations = async ({
  page = 1,
  limit = 20,
} = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(
    100,
    Math.max(1, Number(limit) || 20)
  );

  const filter = {
    verificationStatus: "pending",
  };

  const [organizations, total] = await Promise.all([
    findOrganizationProfiles(filter, {
      skip: (safePage - 1) * safeLimit,
      limit: safeLimit,
      sort: { createdAt: -1 },
    }),

    countOrganizationProfiles(filter),
  ]);

  return {
    organizations: organizations.map((organization) => ({
      id: organization._id.toString(),
      organizationName: organization.organizationName,
      organizationType: organization.organizationType,
      description: organization.description,
      location: organization.location,
      website: organization.website,
      contactEmail: organization.contactEmail,
      verificationStatus: organization.verificationStatus,
      createdAt: organization.createdAt,
    })),

    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

const validateOrganizationId = (organizationId) => {
  if (!mongoose.isValidObjectId(organizationId)) {
    const error = new Error("Invalid organization ID.");
    error.status = 400;
    throw error;
  }
};

const getOrganizationForReview = async (organizationId) => {
  validateOrganizationId(organizationId);

  const organization =
    await findOrganizationProfileById(organizationId);

  if (!organization) {
    const error = new Error("Organization not found.");
    error.status = 404;
    throw error;
  }

  return organization;
};

export const verifyOrganization = async (
  adminId,
  organizationId
) => {
  const organization =
    await getOrganizationForReview(organizationId);

  if (organization.verificationStatus === "verified") {
    const error = new Error("Organization is already verified.");
    error.status = 409;
    throw error;
  }

  const updatedOrganization =
    await updateOrganizationProfileById(organizationId, {
      verificationStatus: "verified",
      verificationNotes: "",
      reviewedBy: adminId,
      reviewedAt: new Date(),
    });

  await createAuditLog({
    actor: adminId,
    action: "organization_verified",
    resourceType: "organization",
    resourceId: organization._id,
    reason: "Organization verification approved.",
    metadata: {
      previousStatus: organization.verificationStatus,
      newStatus: "verified",
    },
  });

  return {
    id: updatedOrganization._id.toString(),
    organizationName: updatedOrganization.organizationName,
    verificationStatus: updatedOrganization.verificationStatus,
    reviewedBy: updatedOrganization.reviewedBy,
    reviewedAt: updatedOrganization.reviewedAt,
  };
};

export const rejectOrganization = async (
  adminId,
  organizationId,
  reason
) => {
  validateOrganizationId(organizationId);

  if (typeof reason !== "string" || !reason.trim()) {
    const error = new Error(
      "A rejection reason is required."
    );
    error.status = 400;
    throw error;
  }

  const normalizedReason = reason.trim();

  if (normalizedReason.length > 1000) {
    const error = new Error(
      "Rejection reason must not exceed 1000 characters."
    );
    error.status = 400;
    throw error;
  }

  const organization =
    await getOrganizationForReview(organizationId);

  if (organization.verificationStatus === "verified") {
    const error = new Error(
      "A verified organization cannot be rejected directly."
    );
    error.status = 409;
    throw error;
  }

  const updatedOrganization =
    await updateOrganizationProfileById(organizationId, {
      verificationStatus: "rejected",
      verificationNotes: normalizedReason,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    });

  await createAuditLog({
    actor: adminId,
    action: "organization_rejected",
    resourceType: "organization",
    resourceId: organization._id,
    reason: normalizedReason,
    metadata: {
      previousStatus: organization.verificationStatus,
      newStatus: "rejected",
    },
  });

  return {
    id: updatedOrganization._id.toString(),
    organizationName: updatedOrganization.organizationName,
    verificationStatus: updatedOrganization.verificationStatus,
    reviewedBy: updatedOrganization.reviewedBy,
    reviewedAt: updatedOrganization.reviewedAt,
  };
};

const validateModerationReason = (reason) => {
  if (typeof reason !== "string" || !reason.trim()) {
    const error = new Error("A moderation reason is required.");
    error.status = 400;
    throw error;
  }

  const normalizedReason = reason.trim();

  if (normalizedReason.length > 1000) {
    const error = new Error(
      "Moderation reason must not exceed 1000 characters."
    );
    error.status = 400;
    throw error;
  }

  return normalizedReason;
};

const moderateUserAccount = async (
  adminId,
  targetUserId,
  reason,
  action
) => {
  if (!mongoose.isValidObjectId(targetUserId)) {
    const error = new Error("Invalid user ID.");
    error.status = 400;
    throw error;
  }

  const normalizedReason = validateModerationReason(reason);

  if (adminId.toString() === targetUserId.toString()) {
    const error = new Error(
      "Administrators cannot moderate their own accounts through this endpoint."
    );
    error.status = 403;
    throw error;
  }

  const targetUser = await findUserById(targetUserId);

  if (!targetUser) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }

  if (targetUser.role === "admin") {
    const error = new Error(
      "Administrator accounts cannot be moderated through this endpoint."
    );
    error.status = 403;
    throw error;
  }

  const expectedCurrentStatus =
    action === "user_suspended" ? "active" : "suspended";

  const newStatus =
    action === "user_suspended" ? "suspended" : "active";

  if (targetUser.status !== expectedCurrentStatus) {
    const error = new Error(
      `Cannot perform this action on an account with status "${targetUser.status}".`
    );
    error.status = 409;
    throw error;
  }

  const updatedUser = await updateUserById(targetUserId, {
    status: newStatus,
  });

  if (!updatedUser) {
    const error = new Error("User could not be updated.");
    error.status = 404;
    throw error;
  }

  await createAuditLog({
    actor: adminId,
    action,
    resourceType: "user",
    resourceId: targetUser._id,
    reason: normalizedReason,
    metadata: {
      previousStatus: targetUser.status,
      newStatus,
      targetRole: targetUser.role,
    },
  });

  return {
    id: updatedUser._id.toString(),
    fullName: updatedUser.fullName,
    role: updatedUser.role,
    status: updatedUser.status,
    updatedAt: updatedUser.updatedAt,
  };
};

export const suspendUserAccount = async (
  adminId,
  targetUserId,
  reason
) => {
  return moderateUserAccount(
    adminId,
    targetUserId,
    reason,
    "user_suspended"
  );
};

export const reactivateUserAccount = async (
  adminId,
  targetUserId,
  reason
) => {
  return moderateUserAccount(
    adminId,
    targetUserId,
    reason,
    "user_reactivated"
  );
};


export const getAllOrganizations = async ({
  page = 1,
  limit = 20,
  status,
} = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter = {};
  
  if (status && ['pending', 'verified', 'rejected'].includes(status)) {
    filter.verificationStatus = status;
  }

  const [organizations, total] = await Promise.all([
    findOrganizationProfiles(filter, {
      skip: (safePage - 1) * safeLimit,
      limit: safeLimit,
      sort: { createdAt: -1 },
    }),
    countOrganizationProfiles(filter),
  ]);

  return {
    organizations: organizations.map((organization) => ({
      id: organization._id.toString(),
      userId: organization.user?.toString(),
      organizationName: organization.organizationName,
      organizationType: organization.organizationType,
      description: organization.description,
      location: organization.location,
      website: organization.website,
      contactEmail: organization.contactEmail,
      verificationStatus: organization.verificationStatus,
      verificationNotes: organization.verificationNotes,
      reviewedBy: organization.reviewedBy?.toString(),
      reviewedAt: organization.reviewedAt,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const getAllUsers = async ({
  page = 1,
  limit = 20,
  role,
  status,
} = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter = {};
  
  if (role && ['talent', 'organization', 'admin'].includes(role)) {
    filter.role = role;
  }
  
  if (status && ['active', 'suspended', 'deleted'].includes(status)) {
    filter.status = status;
  }

  const [users, total] = await Promise.all([
    findUsers(filter, {
      skip: (safePage - 1) * safeLimit,
      limit: safeLimit,
      sort: { createdAt: -1 },
    }),
    countUsers(filter),
  ]);

  return {
    users: users.map((user) => ({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const getAllAuditLogs = async ({
  page = 1,
  limit = 20,
  resourceType,
  actor,
} = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter = {};
  
  if (resourceType && ['user', 'talent_profile', 'organization', 'challenge', 'application', 'project', 'system'].includes(resourceType)) {
    filter.resourceType = resourceType;
  }
  
  if (actor && mongoose.isValidObjectId(actor)) {
    filter.actor = actor;
  }

  const [logs, total] = await Promise.all([
    findAuditLogs(filter, {
      skip: (safePage - 1) * safeLimit,
      limit: safeLimit,
    }),
    countAuditLogs(filter),
  ]);

  return {
    logs: logs.map((log) => ({
      id: log._id.toString(),
      actor: log.actor?.toString(),
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId?.toString(),
      reason: log.reason,
      metadata: log.metadata,
      createdAt: log.createdAt,
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const createNewAuditLog = async (logData) => {
  const { actor, action, resourceType, resourceId, reason, metadata } = logData;

  if (!action || typeof action !== 'string') {
    const error = new Error('Action is required.');
    error.status = 400;
    throw error;
  }

  if (!resourceType || !['user', 'talent_profile', 'organization', 'challenge', 'application', 'project', 'system'].includes(resourceType)) {
    const error = new Error('Valid resourceType is required.');
    error.status = 400;
    throw error;
  }

  const log = await createAuditLog({
    actor: actor || null,
    action: action.trim(),
    resourceType,
    resourceId: resourceId || null,
    reason: reason?.trim() || '',
    metadata: metadata || undefined,
  });

  return {
    id: log._id.toString(),
    actor: log.actor?.toString(),
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId?.toString(),
    reason: log.reason,
    metadata: log.metadata,
    createdAt: log.createdAt,
  };
};

export const updateAuditLog = async (logId, updates) => {
  if (!mongoose.isValidObjectId(logId)) {
    const error = new Error('Invalid audit log ID.');
    error.status = 400;
    throw error;
  }

  const log = await findAuditLogById(logId);
  
  if (!log) {
    const error = new Error('Audit log not found.');
    error.status = 404;
    throw error;
  }

  const allowedUpdates = {};
  if (updates.reason !== undefined) allowedUpdates.reason = updates.reason.trim();
  if (updates.metadata !== undefined) allowedUpdates.metadata = updates.metadata;

  const updatedLog = await updateAuditLogById(logId, allowedUpdates);

  return {
    id: updatedLog._id.toString(),
    actor: updatedLog.actor?.toString(),
    action: updatedLog.action,
    resourceType: updatedLog.resourceType,
    resourceId: updatedLog.resourceId?.toString(),
    reason: updatedLog.reason,
    metadata: updatedLog.metadata,
    createdAt: updatedLog.createdAt,
  };
};

export const deleteAuditLog = async (logId) => {
  if (!mongoose.isValidObjectId(logId)) {
    const error = new Error('Invalid audit log ID.');
    error.status = 400;
    throw error;
  }

  const log = await deleteAuditLogById(logId);
  
  if (!log) {
    const error = new Error('Audit log not found.');
    error.status = 404;
    throw error;
  }

  return {
    id: log._id.toString(),
    message: 'Audit log deleted successfully.',
  };
};
