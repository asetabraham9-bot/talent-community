
import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "beginner",
    },
  },
  { _id: false }
);

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

const talentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
    },

    headline: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    location: {
      type: locationSchema,
      default: () => ({}),
    },

    skills: {
      type: [skillSchema],
      default: [],
    },

    interests: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 80,
        },
      ],
      default: [],
    },

    education: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    portfolioUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    socialLinks: {
      type: [
        {
          platform: {
            type: String,
            trim: true,
            maxlength: 50,
          },
          url: {
            type: String,
            trim: true,
            maxlength: 500,
          },
        },
      ],
      default: [],
    },

    availability: {
      type: String,
      enum: ["available", "open_to_opportunities", "unavailable"],
      default: "open_to_opportunities",
    },

    visibility: {
      type: String,
      enum: ["public", "limited"],
      default: "public",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

talentProfileSchema.index({ skills: 1 });
talentProfileSchema.index({ "location.country": 1, "location.region": 1, "location.city": 1 });

const TalentProfile = mongoose.model(
  "TalentProfile",
  talentProfileSchema
);

export default TalentProfile;
