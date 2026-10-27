import {
  createChallenge,
  findChallengeById,
  findChallenges,
  countChallenges,
  updateChallengeById,
} from "../repositories/challenge.repository.js";

import {
  findOrganizationProfileByUserId,
} from "../repositories/organization-profile.repository.js";

const createServiceError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const editableFields = [
  "title",
  "description",
  "category",
  "requiredSkills",
  "location",
  "participationType",
  "deadline",
  "visibility",
  "expectedDeliverables",
  "eligibility",
  "duration",
  "compensationType",
  "compensationDetails",
];

const pickEditableFields = (data = {}) => {
  const result = {};

  for (const field of editableFields) {
    if (data[field] !== undefined) {
      result[field] = data[field];
    }
  }

  return result;
};

const getOrganizationForUser = async (userId) => {
  const organization = await findOrganizationProfileByUserId(userId);

  if (!organization) {
    throw createServiceError(
      "Create your organization profile before managing challenges.",
      404
    );
  }

  return organization;
};

const getOwnedChallenge = async (challengeId, organizationId) => {
  const challenge = await findChallengeById(challengeId);

  if (!challenge) {
    throw createServiceError("Challenge not found.", 404);
  }

  if (challenge.organization.toString() !== organizationId.toString()) {
    throw createServiceError(
      "You do not have permission to manage this challenge.",
      403
    );
  }

  return challenge;
};

// Create a draft for the logged-in organization.
export const createMyChallenge = async (userId, data = {}) => {
  const organization = await getOrganizationForUser(userId);
  const challengeData = pickEditableFields(data);

  return createChallenge({
    ...challengeData,
    organization: organization._id,
    createdBy: userId,
    status: "draft",
  });
};

// Return challenges belonging to the logged-in organization.
export const getMyChallenges = async (userId, options = {}) => {
  const organization = await getOrganizationForUser(userId);

  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(options.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = { organization: organization._id };

  const [challenges, total] = await Promise.all([
    findChallenges(filter, { skip, limit }),
    countChallenges(filter),
  ]);

  return {
    challenges,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Public challenge browsing.
export const browseChallenges = async (options = {}) => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(options.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = {
    status: "published",
    visibility: "public",
  };

  const [challenges, total] = await Promise.all([
    findChallenges(filter, { skip, limit }),
    countChallenges(filter),
  ]);

  return {
    challenges,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Read one publicly visible challenge.
export const getPublicChallengeById = async (challengeId) => {
  const challenge = await findChallengeById(challengeId);

  if (
    !challenge ||
    challenge.status !== "published" ||
    challenge.visibility !== "public"
  ) {
    throw createServiceError("Challenge not found.", 404);
  }

  return challenge;
};

// Update an organization's own challenge.
export const updateMyChallenge = async (
  userId,
  challengeId,
  data = {}
) => {
  const organization = await getOrganizationForUser(userId);

  const challenge = await getOwnedChallenge(
    challengeId,
    organization._id
  );

  if (["closed", "archived"].includes(challenge.status)) {
    throw createServiceError(
      "Closed or archived challenges cannot be edited.",
      409
    );
  }

  const updates = pickEditableFields(data);

  if (Object.keys(updates).length === 0) {
    throw createServiceError(
      "Provide at least one valid challenge field to update.",
      400
    );
  }

  // A published challenge cannot be edited by an unverified organization.
  if (
    challenge.status === "published" &&
    organization.verificationStatus !== "verified"
  ) {
    throw createServiceError(
      "Your organization must be verified to manage a published challenge.",
      403
    );
  }

  return updateChallengeById(challengeId, updates);
};

// Publish, pause, close, or archive an organization's own challenge.
export const updateMyChallengeStatus = async (
  userId,
  challengeId,
  newStatus
) => {
  const allowedStatuses = [
    "published",
    "paused",
    "closed",
    "archived",
  ];

  if (!allowedStatuses.includes(newStatus)) {
    throw createServiceError("Invalid challenge status.", 400);
  }

  const organization = await getOrganizationForUser(userId);

  const challenge = await getOwnedChallenge(
    challengeId,
    organization._id
  );

  if (challenge.status === "archived") {
    throw createServiceError(
      "Archived challenges cannot change status.",
      409
    );
  }

  if (newStatus === "published") {
    if (organization.verificationStatus !== "verified") {
      throw createServiceError(
        "Your organization must be verified before publishing challenges.",
        403
      );
    }

    if (new Date(challenge.deadline) <= new Date()) {
      throw createServiceError(
        "The deadline must be in the future before publishing.",
        400
      );
    }
  }

  return updateChallengeById(challengeId, {
    status: newStatus,
  });
};
