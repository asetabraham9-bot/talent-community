
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
      immutable: true,
    },

    talent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    coverMessage: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 3000,
    },

    relevantSkills: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 60,
        },
      ],
      default: [],
    },

    portfolioLinks: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 500,
        },
      ],
      default: [],
    },

    status: {
      type: String,
      enum: [
        "submitted",
        "shortlisted",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      default: "submitted",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// One application per talent per challenge.
applicationSchema.index(
  { challenge: 1, talent: 1 },
  { unique: true }
);

// Supports dashboard queries and application filtering.
applicationSchema.index({ talent: 1, status: 1 });
applicationSchema.index({ challenge: 1, status: 1 });

const Application = mongoose.model(
  "Application",
  applicationSchema
);

export default Application;
