
import Project from "../models/Project.js";

export const createProject = (projectData) => {
  return Project.create(projectData);
};

export const findProjectById = (projectId) => {
  return Project.findById(projectId);
};

export const findProjectByChallengeId = (challengeId) => {
  return Project.findOne({ challenge: challengeId });
};

export const findProjects = (filter = {}, options = {}) => {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;

  return Project.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const updateProjectById = (projectId, updates) => {
  return Project.findByIdAndUpdate(
    projectId,
    updates,
    { new: true, runValidators: true }
  );
};

export const addProjectContributor = (projectId, userId) => {
  return Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { contributors: userId } },
    { new: true, runValidators: true }
  );
};
