
import {
  registerAccount,
  loginAccount,
} from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerAccount(req.body ?? {});

    return res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginAccount(req.body ?? {});

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
