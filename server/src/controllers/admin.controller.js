import { getAdminProfile } from "../services/admin.service.js";

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
