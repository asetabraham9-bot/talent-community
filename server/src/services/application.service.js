import mongoose from "mongoose";

import {
  createApplication,
  findApplicationById,
  findApplicationByChallengeAndTalent,
  findApplications,
  countApplications,
  updateApplicationById,
} from "../repositories/application.repository.js";

import {
  findChallengeById,
} from "../repositories/challenge.repository.js";

import {
  findOrganizationProfileByUserId,
} from "../repositories/organization-profile.repository.js";

import {
  findTalentProfileByUserId,
} from "../repositories/talent-profile.repository.js";

const serviceError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const pickApplicationFields = (data = {}) => {
  const allowedFields = [
    "coverMessage",
    "relevantSkills",
    "portfolioLinks",
  ];

  const result = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      result[field] = data[field];
    }
  }

  return result;
};

const requireValidId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) {
    throw serviceError(`Invalid ${label}.`, 400);
  }
};

const requireTalentProfile = async (userId) => {
  const profile = await findTalentProfileByUserId(userId);

  if (!profile) {
    throw serviceError(
      "Create your talent profile before applying.",
      403
    );
  }

  return profile;
};

export const submitApplication = async (userId, data = {}) => {
  const challengeId = data.challengeId;

  requireValidId(challengeId, "challenge ID");

  const challenge = await findChallengeById(challengeId);

  if (
    !challenge ||
    challenge.status !== "published" ||
    challenge.visibility !== "public"
  ) {
    throw serviceError(
      "This challenge is not available for applications.",
      404
    );
  }

  if (new Date(challenge.deadline) <= new Date()) {
    throw serviceError(
      "The application deadline has passed.",
      400
    );
  }

  await requireTalentProfile(userId);

  const existingApplication =
    await findApplicationByChallengeAndTalent(
      challenge._id,
      userId
    );

  if (existingApplication) {
    throw serviceError(
      "You have already applied to this challenge.",
      409
    );
  }

  const fields = pickApplicationFields(data);

  return createApplication({
    ...fields,
    challenge: challenge._id,
    talent: userId,
  });
};

export const getMyApplications = async (
  userId,
  { page = 1, limit = 20 } = {}
) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(
    100,
    Math.max(1, Number(limit) || 20)
  );

  const filter = { talent: userId };

  const [applications, total] = await Promise.all([
    findApplications(filter, {
      skip: (safePage - 1) * safeLimit,
      limit: safeLimit,
    }),
    countApplications(filter),
  ]);

  return {
    applications,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
};

export const getChallengeApplications = async (
  userId,
  challengeId,
  { page = 1, limit = 20 } = {}
) => {
  requireValidId(challengeId, "challenge ID");

  const challenge = await findChallengeById(challengeId);

  if (!challenge) {
    throw serviceError("Challenge not found.", 404);
  }

  const organization =
    await findOrganizationProfileByUserId(userId);

  if (
    !organization ||
    challenge.organization.toString() !==
      organization._id.toString()
  ) {
    throw serviceError(
      "You cannot view applications for this challenge.",
      403
    );
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(
    100,
    Math.max(1, Number(limit) || 20)
  );

  const filter = { challenge: challenge._id };

  const [applications, total] = await Promise.all([
    findApplications(filter, {
      skip: (safePage - 1) * safeLimit,
      limit: safeLimit,
    }),
    countApplications(filter),
  ]);

  return {
    applications,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
};

export const getApplicationById = async (
  userId,
  role,
  applicationId
) => {
  requireValidId(applicationId, "application ID");

  const application = await findApplicationById(applicationId);

  if (!application) {
    throw serviceError("Application not found.", 404);
  }

  if (role === "talent") {
    if (application.talent.toString() !== userId) {
      throw serviceError("Application not found.", 404);
    }

    return application;
  }

  if (role === "organization") {
    const challenge = await findChallengeById(
      application.challenge
    );

    const organization =
      await findOrganizationProfileByUserId(userId);

    if (
      !challenge ||
      !organization ||
      challenge.organization.toString() !==
        organization._id.toString()
    ) {
      throw serviceError("Application not found.", 404);
    }

    return application;
  }

  throw serviceError("Access denied.", 403);
};

export const withdrawApplication = async (
  userId,
  applicationId
) => {
  requireValidId(applicationId, "application ID");

  const application = await findApplicationById(applicationId);

  if (
    !application ||
    application.talent.toString() !== userId
  ) {
    throw serviceError("Application not found.", 404);
  }

  if (
    !["submitted", "shortlisted"].includes(application.status)
  ) {
    throw serviceError(
      "This application can no longer be withdrawn.",
      409
    );
  }

  return updateApplicationById(applicationId, {
    status: "withdrawn",
  });
};

export const reviewApplication = async (
  userId,
  applicationId,
  data = {}
) => {
  requireValidId(applicationId, "application ID");

  const application = await findApplicationById(applicationId);

  if (!application) {
    throw serviceError("Application not found.", 404);
  }

  const challenge = await findChallengeById(
    application.challenge
  );

  const organization =
    await findOrganizationProfileByUserId(userId);

  if (
    !challenge ||
    !organization ||
    challenge.organization.toString() !==
      organization._id.toString()
  ) {
    throw serviceError(
      "You cannot review this application.",
      403
    );
  }

  const allowedStatuses = [
    "shortlisted",
    "accepted",
    "rejected",
  ];

  if (!allowedStatuses.includes(data.status)) {
    throw serviceError(
      "Choose shortlisted, accepted, or rejected.",
      400
    );
  }

  if (
    ["withdrawn", "rejected"].includes(application.status)
  ) {
    throw serviceError(
      "This application can no longer be reviewed.",
      409
    );
  }

  const updates = {
    status: data.status,
    reviewedBy: userId,
  };

  if (typeof data.reviewNotes === "string") {
    updates.reviewNotes = data.reviewNotes.trim();
  }

  return updateApplicationById(applicationId, updates);
};
