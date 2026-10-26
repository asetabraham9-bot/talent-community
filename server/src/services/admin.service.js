
import { findUserById } from "../repositories/user.repository.js";

export const getAdminProfile = async (userId) => {
  const user = await findUserById(userId);

  if (!user || user.role !== "admin" || user.status !== "active") {
    const error = new Error("Admin account not found or unavailable.");
    error.status = 404;
    throw error;
  }

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
