import {
  getMyOrganizationProfile,
  createMyOrganizationProfile,
  updateMyOrganizationProfile,
} from "../services/organization-profile.service.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await getMyOrganizationProfile(req.user.id);

    return res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
};

export const createMyProfile = async (req, res, next) => {
  try {
    const profile = await createMyOrganizationProfile(
      req.user.id,
      req.body ?? {}
    );

    return res.status(201).json({
      success: true,
      message: "Organization profile created successfully.",
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await updateMyOrganizationProfile(
      req.user.id,
      req.body ?? {}
    );

    return res.status(200).json({
      success: true,
      message: "Organization profile updated successfully.",
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
};
