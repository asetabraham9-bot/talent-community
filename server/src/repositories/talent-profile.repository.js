
import TalentProfile from "../models/TalentProfile.js";

export const createTalentProfile = (profileData) => {
  return TalentProfile.create(profileData);
};

export const findTalentProfileByUserId = (userId) => {
  return TalentProfile.findOne({ user: userId });
};

export const findTalentProfileById = (profileId) => {
  return TalentProfile.findById(profileId);
};

export const findTalentProfiles = (filter = {}, options = {}) => {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;

  return TalentProfile.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const updateTalentProfileByUserId = (userId, updates) => {
  return TalentProfile.findOneAndUpdate(
    { user: userId },
    updates,
    { new: true, runValidators: true }
  );
};
