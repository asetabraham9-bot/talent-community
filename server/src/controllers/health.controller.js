
import { getHealthStatus } from "../services/health.service.js";

export const getHealth = (req, res) => {
  const status = getHealthStatus();

  res.status(200).json({
    success: true,
    message: "Talent Community API is running!",
    database: status.database,
  });
};
