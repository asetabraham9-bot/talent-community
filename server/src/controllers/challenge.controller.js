import {
  createMyChallenge,
  getMyChallenges,
  browseChallenges,
  getPublicChallengeById,
  updateMyChallenge,
  updateMyChallengeStatus,
} from "../services/challenge.service.js";

export const createChallengeHandler = async (req, res, next) => {
  try {
    const challenge = await createMyChallenge(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Challenge draft created successfully.",
      data: challenge,
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyChallengesHandler = async (req, res, next) => {
  try {
    const result = await getMyChallenges(req.user.id, req.query);

    return res.status(200).json({
      success: true,
      data: result.challenges,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

export const browseChallengesHandler = async (req, res, next) => {
  try {
    const result = await browseChallenges(req.query);

    return res.status(200).json({
      success: true,
      data: result.challenges,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

export const getPublicChallengeHandler = async (req, res, next) => {
  try {
    const challenge = await getPublicChallengeById(req.params.id);

    return res.status(200).json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateChallengeHandler = async (req, res, next) => {
  try {
    const challenge = await updateMyChallenge(
      req.user.id,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Challenge updated successfully.",
      data: challenge,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateChallengeStatusHandler = async (req, res, next) => {
  try {
    const challenge = await updateMyChallengeStatus(
      req.user.id,
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: "Challenge status updated successfully.",
      data: challenge,
    });
  } catch (error) {
    return next(error);
  }
};
