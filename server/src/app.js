
import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import talentProfileRoutes from "./routes/talent-profile.routes.js";
import organizationProfileRoutes from "./routes/organization-profile.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import challengeRoutes from "./routes/challenge.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import projectRoutes from "./routes/project.routes.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/talent", talentProfileRoutes);
app.use("/api/talent-profiles", talentProfileRoutes);
app.use("/api/organization", organizationProfileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/projects", projectRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
