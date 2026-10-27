import {
  getAdminProfile,
  getPendingOrganizations,
  verifyOrganization,
  rejectOrganization,
  suspendUserAccount,
  reactivateUserAccount,
} from "../services/admin.service.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await getAdminProfile(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Admin profile retrieved successfully.",
      data: profile,
    });
  } catch (error) {
    return next(error);
  }
};

export const getPendingOrganizationsHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await getPendingOrganizations({
      page: req.query.page,
      limit: req.query.limit,
    });

    return res.status(200).json({
      success: true,
      message: "Pending organizations retrieved successfully.",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyOrganizationHandler = async (
  req,
  res,
  next
) => {
  try {
    const organization = await verifyOrganization(
      req.user.id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Organization verified successfully.",
      data: organization,
    });
  } catch (error) {
    return next(error);
  }
};

export const rejectOrganizationHandler = async (
  req,
  res,
  next
) => {
  try {
    const organization = await rejectOrganization(
      req.user.id,
      req.params.id,
      req.body?.reason
    );

    return res.status(200).json({
      success: true,
      message: "Organization rejected successfully.",
      data: organization,
    });
  } catch (error) {
    return next(error);
  }
};

export const suspendUserAccountHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = await suspendUserAccount(
      req.user.id,
      req.params.id,
      req.body?.reason
    );

    return res.status(200).json({
      success: true,
      message: "User account suspended successfully.",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

export const reactivateUserAccountHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = await reactivateUserAccount(
      req.user.id,
      req.params.id,
      req.body?.reason
    );

    return res.status(200).json({
      success: true,
      message: "User account reactivated successfully.",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};