
import {
  submitApplication,
  getMyApplications,
  getChallengeApplications,
  getApplicationById,
  withdrawApplication,
  reviewApplication,
} from "../services/application.service.js";

// Submit an application
export const submitApplicationHandler = async (req, res, next) => {
  try {
    const application = await submitApplication(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Get the logged-in talent's applications
export const getMyApplicationsHandler = async (req, res, next) => {
  try {
    const result = await getMyApplications(req.user.id, req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get applications submitted to an organization's challenge
export const getChallengeApplicationsHandler = async (req, res, next) => {
  try {
    const result = await getChallengeApplications(
      req.user.id,
      req.params.challengeId,
      req.query,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get one application
export const getApplicationByIdHandler = async (req, res, next) => {
  try {
    const application = await getApplicationById(
      req.user.id,
      req.user.role,
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw an application
export const withdrawApplicationHandler = async (req, res, next) => {
  try {
    const application = await withdrawApplication(
      req.user.id,
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      message: "Application withdrawn successfully.",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Review an application
export const reviewApplicationHandler = async (req, res, next) => {
  try {
    const application = await reviewApplication(
      req.user.id,
      req.params.id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Application reviewed successfully.",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
