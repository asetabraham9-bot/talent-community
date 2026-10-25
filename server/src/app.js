
import express from "express";
import cors from "cors";

import apiRoutes from "./routes/index.routes.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api", apiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
