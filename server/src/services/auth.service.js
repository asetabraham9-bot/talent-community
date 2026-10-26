import jwt from "jsonwebtoken";

import {
  createUser,
  findUserByEmail,
} from "../repositories/user.repository.js";

import {
  hashPassword,
  comparePassword,
} from "../utils/password.util.js";

const PUBLIC_ROLES = ["talent", "organization"];

const createToken = (user) => {
  const { JWT_SECRET, JWT_EXPIRES_IN = "1d" } = process.env;

  if (!JWT_SECRET || JWT_SECRET === "replace_with_a_secure_random_secret") {
    throw new Error("JWT_SECRET must be configured securely.");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const toSafeUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  status: user.status,
  isEmailVerified: user.isEmailVerified,
});

const createServiceError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const registerAccount = async ({
  fullName,
  email,
  password,
  role,
}) => {
  if (!fullName?.trim() || !email?.trim() || !password || !role) {
    throw createServiceError(
      "Full name, email, password, and role are required.",
      400
    );
  }

  if (!PUBLIC_ROLES.includes(role)) {
    throw createServiceError(
      "Registration is only available for talent and organization accounts.",
      400
    );
  }

  if (typeof password !== "string" || password.length < 8) {
    throw createServiceError(
      "Password must contain at least 8 characters.",
      400
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw createServiceError(
      "An account with this email already exists.",
      409
    );
  }

  const passwordHash = await hashPassword(password);

  let user;

  try {
    user = await createUser({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
    });
  } catch (error) {
    // A duplicate-key error can occur if simultaneous requests
    // attempt to register the same email.
    if (error.code === 11000) {
      throw createServiceError(
        "An account with this email already exists.",
        409
      );
    }

    throw error;
  }

  return {
    user: toSafeUser(user),
  };
};

export const loginAccount = async ({ email, password }) => {
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    throw createServiceError("Email and password are required.", 400);
  }

  const user = await findUserByEmail(email.trim().toLowerCase());

  if (!user) {
    throw createServiceError("Invalid email or password.", 401);
  }

  const passwordMatches = await comparePassword(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw createServiceError("Invalid email or password.", 401);
  }

  if (user.status !== "active") {
    throw createServiceError(
      "This account is not active. Please contact support.",
      403
    );
  }

  const token = createToken(user);

  return {
    user: toSafeUser(user),
    token,
  };
};
