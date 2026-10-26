import {
  createOrganizationProfile,
  findOrganizationProfileByUserId,
  updateOrganizationProfileById,
} from "../repositories/organization-profile.repository.js";

const createServiceError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const editableFields = [
  "organizationName",
  "organizationType",
  "description",
  "location",
  "website",
  "contactEmail",
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

export const getMyOrganizationProfile = async (userId) => {
  return findOrganizationProfileByUserId(userId);
};

export const createMyOrganizationProfile = async (
  userId,
  data = {}
) => {
  const existingProfile = await findOrganizationProfileByUserId(userId);

  if (existingProfile) {
    throw createServiceError(
      "Your organization profile already exists.",
      409
    );
  }

  const profileData = pickEditableFields(data);

  return createOrganizationProfile({
    ...profileData,
    user: userId,
  });
};

export const updateMyOrganizationProfile = async (
  userId,
  data = {}
) => {
  const profile = await findOrganizationProfileByUserId(userId);

  if (!profile) {
    throw createServiceError(
      "Organization profile not found. Create your profile first.",
      404
    );
  }

  const updates = pickEditableFields(data);

  if (Object.keys(updates).length === 0) {
    throw createServiceError(
      "Provide at least one valid profile field to update.",
      400
    );
  }

  return updateOrganizationProfileById(profile._id, updates);
};
