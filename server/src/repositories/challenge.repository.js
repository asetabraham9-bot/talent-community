
import Challenge from "../models/Challenge.js";

export const createChallenge = (challengeData) => {
  return Challenge.create(challengeData);
};

export const findChallengeById = (challengeId) => {
  return Challenge.findById(challengeId);
};

export const findChallenges = (filter = {}, options = {}) => {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;

  return Challenge.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const countChallenges = (filter = {}) => {
  return Challenge.countDocuments(filter);
};

export const updateChallengeById = (challengeId, updates) => {
  return Challenge.findByIdAndUpdate(
    challengeId,
    updates,
    { new: true, runValidators: true }
  );
};

export const deleteChallengeById = (challengeId) => {
  return Challenge.findByIdAndDelete(challengeId);
};
