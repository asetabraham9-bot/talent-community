
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
      unique: true,
      immutable: true,
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      immutable: true,
    },

    contributors: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: [
        "planned",
        "in-progress",
        "completed",
        "cancelled",
      ],
      default: "planned",
    },

    startDate: {
      type: Date,
      default: null,
    },

    targetCompletionDate: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    outcomeSummary: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    deliverableLinks: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 500,
        },
      ],
      default: [],
    },

    visibility: {
      type: String,
      enum: ["public", "restricted"],
      default: "public",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

projectSchema.index({ contributors: 1 });
projectSchema.index({ organization: 1, status: 1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
