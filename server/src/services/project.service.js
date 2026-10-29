import mongoose from "mongoose";

import {
  createProject,
  findProjectById,
  findProjectByChallengeId,
  findProjects,
  updateProjectById,
  addProjectContributor,
} from "../repositories/project.repository.js";

import {
  findChallengeById,
} from "../repositories/challenge.repository.js";

import {
  findOrganizationProfileByUserId,
} from "../repositories/organization-profile.repository.js";

import {
  findApplications,
} from "../repositories/application.repository.js";

const serviceError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const requireValidId = (id, fieldName = "ID") => {
  if (!mongoose.isValidObjectId(id)) {
    throw serviceError(`Invalid ${fieldName}.`);
  }
};

const toId = (value) => String(value?._id ?? value);

const isSameId = (first, second) => toId(first) === toId(second);

const getOrganizationProfile = async (userId) => {
  const profile = await findOrganizationProfileByUserId(userId);

  if (!profile) {
    throw serviceError("Create your organization profile first.", 404);
  }

  if (profile.verificationStatus !== "verified") {
    throw serviceError(
      "Your organization must be verified to manage projects.",
      403,
    );
  }

  return profile;
};

const requireProjectOwner = async (userId, project) => {
  const organization = await getOrganizationProfile(userId);

  if (!isSameId(project.organization, organization._id)) {
    throw serviceError("You cannot manage another organization's project.", 403);
  }

  return organization;
};

const getAcceptedApplications = async (challengeId) => {
  return findApplications(
    { challenge: challengeId, status: "accepted" },
    { skip: 0, limit: 1000, sort: { createdAt: 1 } },
  );
};

const synchronizeAcceptedContributors = async (project, challengeId) => {
  const acceptedApplications = await getAcceptedApplications(challengeId);

  let updatedProject = project;

  for (const application of acceptedApplications) {
    updatedProject = await addProjectContributor(
      updatedProject._id,
      application.talent,
    );

    if (!updatedProject) {
      throw serviceError("Project not found while updating contributors.", 404);
    }
  }

  return updatedProject;
};

// Create the shared project for a challenge.
// Repeated calls reuse the existing project instead of creating another.
export const createChallengeProject = async (userId, challengeId) => {
  requireValidId(challengeId, "challenge ID");

  const organization = await getOrganizationProfile(userId);
  const challenge = await findChallengeById(challengeId);

  if (!challenge) {
    throw serviceError("Challenge not found.", 404);
  }

  if (!isSameId(challenge.organization, organization._id)) {
    throw serviceError("You can only create a project for your own challenge.", 403);
  }

  const acceptedApplications = await getAcceptedApplications(challenge._id);

  if (acceptedApplications.length === 0) {
    throw serviceError(
      "Accept at least one application before creating a project.",
      400,
    );
  }

  let project = await findProjectByChallengeId(challenge._id);

  if (!project) {
    try {
      project = await createProject({
        title: challenge.title,
        description: challenge.description,
        challenge: challenge._id,
        organization: organization._id,
        contributors: acceptedApplications.map((application) => application.talent),
        status: "planned",
      });
    } catch (error) {
      // Another request may have created the project concurrently.
      if (error.code !== 11000) {
        throw error;
      }

      project = await findProjectByChallengeId(challenge._id);

      if (!project) {
        throw error;
      }
    }
  }

  return synchronizeAcceptedContributors(project, challenge._id);
};

// Get projects owned by the logged-in organization.
export const getMyProjects = async (
  userId,
  { page = 1, limit = 20 } = {},
) => {
  const organization = await getOrganizationProfile(userId);

  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(
    100,
    Math.max(1, Number.parseInt(limit, 10) || 20),
  );

  return findProjects(
    { organization: organization._id },
    {
      skip: (safePage - 1) * safeLimit,
      limit: safeLimit,
      sort: { createdAt: -1 },
    },
  );
};

// Retrieve a project after checking visibility and ownership.
export const getProjectById = async (userId, role, projectId) => {
  requireValidId(projectId, "project ID");

  const project = await findProjectById(projectId);

  if (!project) {
    throw serviceError("Project not found.", 404);
  }

  if (role === "organization") {
    const organization = await findOrganizationProfileByUserId(userId);

    if (
      organization &&
      isSameId(project.organization, organization._id)
    ) {
      return project;
    }
  }

  if (role === "talent") {
    const isContributor = project.contributors.some((contributorId) =>
      isSameId(contributorId, userId),
    );

    if (isContributor) {
      return project;
    }
  }

  if (project.visibility === "public") {
    return project;
  }

  throw serviceError("You do not have permission to view this project.", 403);
};

// Update allowed project fields. Ownership is always checked.
export const updateMyProject = async (userId, projectId, data = {}) => {
  requireValidId(projectId, "project ID");

  const project = await findProjectById(projectId);

  if (!project) {
    throw serviceError("Project not found.", 404);
  }

  await requireProjectOwner(userId, project);

  if (["completed", "cancelled"].includes(project.status)) {
    throw serviceError(
      "Completed or cancelled projects cannot be edited.",
      400,
    );
  }

  const allowedFields = [
    "title",
    "description",
    "targetCompletionDate",
    "outcomeSummary",
    "deliverableLinks",
    "visibility",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(data, field)) {
      updates[field] = data[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw serviceError("Provide at least one valid project field.");
  }

  return updateProjectById(projectId, updates);
};

// Change the project's lifecycle status.
export const updateMyProjectStatus = async (
  userId,
  projectId,
  newStatus,
) => {
  requireValidId(projectId, "project ID");

  const allowedStatuses = [
    "planned",
    "in-progress",
    "completed",
    "cancelled",
  ];

  if (!allowedStatuses.includes(newStatus)) {
    throw serviceError("Invalid project status.");
  }

  const project = await findProjectById(projectId);

  if (!project) {
    throw serviceError("Project not found.", 404);
  }

  await requireProjectOwner(userId, project);

  if (["completed", "cancelled"].includes(project.status)) {
    throw serviceError(
      "Completed or cancelled projects cannot change status.",
      400,
    );
  }

  const updates = { status: newStatus };

  if (newStatus === "in-progress" && !project.startDate) {
    updates.startDate = new Date();
  }

  if (newStatus === "completed") {
    updates.completedAt = new Date();
  }

  return updateProjectById(projectId, updates);
};

// Retrieve a project by its challenge ID for a talent contributor.
export const getProjectByChallengeForTalent = async (userId, challengeId) => {
  requireValidId(challengeId, "challenge ID");

  const project = await findProjectByChallengeId(challengeId);

  if (!project) {
    throw serviceError("No project found for this challenge.", 404);
  }

  const isContributor = project.contributors.some((id) =>
    isSameId(id, userId),
  );

  if (!isContributor && project.visibility !== "public") {
    throw serviceError(
      "You do not have permission to view this project.",
      403,
    );
  }

  return project;
};
