
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

export const findUsers = (filter = {}, options = {}) => {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;

  return User.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const countUsers = (filter = {}) => {
  return User.countDocuments(filter);
};
