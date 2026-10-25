
import Application from "../models/Application.js";

export const createApplication = (applicationData) => {
  return Application.create(applicationData);
};

export const findApplicationById = (applicationId) => {
  return Application.findById(applicationId);
};

export const findApplicationByChallengeAndTalent = (
  challengeId,
  talentId
) => {
  return Application.findOne({
    challenge: challengeId,
    talent: talentId,
  });
};

export const findApplications = (filter = {}, options = {}) => {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;

  return Application.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const countApplications = (filter = {}) => {
  return Application.countDocuments(filter);
};

export const updateApplicationById = (applicationId, updates) => {
  return Application.findByIdAndUpdate(
    applicationId,
    updates,
    { new: true, runValidators: true }
  );
};
