import {
  createTalentProfile,
  findTalentProfileByUserId,
  findTalentProfiles,
  updateTalentProfileByUserId,
} from "../repositories/talent-profile.repository.js";

const createServiceError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const editableFields = [
  "headline",
  "bio",
  "location",
  "skills",
  "interests",
  "education",
  "portfolioUrl",
  "socialLinks",
  "availability",
  "visibility",
];

const pickEditableFields = (data) => {
  const updates = {};

  for (const field of editableFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  return updates;
};

export const getMyTalentProfile = async (userId) => {
  const profile = await findTalentProfileByUserId(userId);

  return profile;
};

export const createMyTalentProfile = async (userId, data = {}) => {
  const existingProfile = await findTalentProfileByUserId(userId);

  if (existingProfile) {
    throw createServiceError(
      "Your talent profile already exists.",
      409
    );
  }

  const profileData = pickEditableFields(data);

  return createTalentProfile({
    ...profileData,
    user: userId,
  });
};

export const updateMyTalentProfile = async (userId, data = {}) => {
  const updates = pickEditableFields(data);

  if (Object.keys(updates).length === 0) {
    throw createServiceError(
      "Provide at least one valid profile field to update.",
      400
    );
  }

  const profile = await updateTalentProfileByUserId(userId, updates);

  if (!profile) {
    throw createServiceError(
      "Talent profile not found. Create your profile first.",
      404
    );
  }

  return profile;
};

export const browseTalentProfiles = async ({ page = 1, limit = 20 } = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter = { visibility: "public" };

  const profiles = await findTalentProfiles(filter, {
    skip: (safePage - 1) * safeLimit,
    limit: safeLimit,
  });

  // Count is not on the repository yet; derive pagination from results length
  return {
    profiles,
    pagination: {
      page: safePage,
      limit: safeLimit,
    },
  };
};
