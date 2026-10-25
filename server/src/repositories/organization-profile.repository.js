
import OrganizationProfile from "../models/OrganizationProfile.js";

export const createOrganizationProfile = (profileData) => {
  return OrganizationProfile.create(profileData);
};

export const findOrganizationProfileByUserId = (userId) => {
  return OrganizationProfile.findOne({ user: userId });
};

export const findOrganizationProfileById = (profileId) => {
  return OrganizationProfile.findById(profileId);
};

export const findOrganizationProfiles = (filter = {}, options = {}) => {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;

  return OrganizationProfile.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const updateOrganizationProfileById = (profileId, updates) => {
  return OrganizationProfile.findByIdAndUpdate(
    profileId,
    updates,
    { new: true, runValidators: true }
  );
};
