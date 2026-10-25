
import mongoose from "mongoose";

export const getHealthStatus = () => ({
  database:
    mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected",
});
