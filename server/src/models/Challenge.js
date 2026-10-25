
import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      trim: true,
      default: "Ethiopia",
      maxlength: 100,
    },
    region: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    city: {
      type: String,
      trim: true,
      maxlength: 100,
    },
  },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 30,
      maxlength: 5000,
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      immutable: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "technology",
        "education",
        "health",
        "agriculture",
        "environment",
        "business",
        "community",
        "engineering",
        "other",
      ],
    },

    requiredSkills: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 60,
        },
      ],
      default: [],
    },

    location: {
      type: locationSchema,
      default: () => ({}),
    },

    participationType: {
      type: String,
      required: true,
      enum: ["remote", "on-site", "hybrid"],
    },

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "published",
        "paused",
        "closed",
        "archived",
      ],
      default: "draft",
    },

    visibility: {
      type: String,
      enum: ["public", "restricted"],
      default: "public",
    },

    expectedDeliverables: {
      type: [String],
      default: [],
    },

    eligibility: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    duration: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    compensationType: {
      type: String,
      enum: ["paid", "voluntary", "supported", "unspecified"],
      default: "unspecified",
    },

    compensationDetails: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

challengeSchema.index({ status: 1, deadline: 1 });
challengeSchema.index({ organization: 1, createdAt: -1 });
challengeSchema.index({ category: 1, status: 1 });
challengeSchema.index({ visibility: 1, status: 1 });

const Challenge = mongoose.model("Challenge", challengeSchema);

export default Challenge;
