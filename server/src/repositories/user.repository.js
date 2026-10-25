
import User from "../models/User.js";

export const createUser = (userData) => {
  return User.create(userData);
};

export const findUserByEmail = (email) => {
  return User.findOne({ email }).select("+passwordHash");
};

export const findUserById = (userId) => {
  return User.findById(userId);
};

export const findUserByIdWithPassword = (userId) => {
  return User.findById(userId).select("+passwordHash");
};

export const updateUserById = (userId, updates) => {
  return User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
};
