
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

const organizationProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
    },

    organizationName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    organizationType: {
      type: String,
      required: true,
      enum: [
        "business",
        "institution",
        "nonprofit",
        "community_group",
        "other",
      ],
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 3000,
    },

    location: {
      type: locationSchema,
      default: () => ({}),
    },

    website: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      default: "",
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    verificationNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
      select: false,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

organizationProfileSchema.index({ verificationStatus: 1 });
organizationProfileSchema.index({ organizationName: 1 });

const OrganizationProfile = mongoose.model(
  "OrganizationProfile",
  organizationProfileSchema
);

export default OrganizationProfile;
