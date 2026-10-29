import {
  createChallengeProject,
  getMyProjects,
  getProjectById,
  updateMyProject,
  updateMyProjectStatus,
  getProjectByChallengeForTalent,
} from "../services/project.service.js";

// Create or retrieve the shared project for a challenge.
export const createChallengeProjectHandler = async (req, res, next) => {
  try {
    const project = await createChallengeProject(
      req.user.id,
      req.body.challengeId,
    );

    return res.status(201).json({
      success: true,
      message: "Project created or retrieved successfully.",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// List projects belonging to the logged-in organization.
export const getMyProjectsHandler = async (req, res, next) => {
  try {
    const projects = await getMyProjects(req.user.id, req.query);

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve a project using its ID.
export const getProjectByIdHandler = async (req, res, next) => {
  try {
    const project = await getProjectById(
      req.user.id,
      req.user.role,
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Update permitted project details.
export const updateMyProjectHandler = async (req, res, next) => {
  try {
    const project = await updateMyProject(
      req.user.id,
      req.params.id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Change the project's lifecycle status.
export const updateMyProjectStatusHandler = async (req, res, next) => {
  try {
    const project = await updateMyProjectStatus(
      req.user.id,
      req.params.id,
      req.body.status,
    );

    return res.status(200).json({
      success: true,
      message: "Project status updated successfully.",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Talent: retrieve a project linked to a specific challenge.
export const getProjectByChallengeHandler = async (req, res, next) => {
  try {
    const project = await getProjectByChallengeForTalent(
      req.user.id,
      req.params.challengeId,
    );

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
