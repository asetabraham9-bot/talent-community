
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      minlength: [2, "Full name must contain at least 2 characters."],
      maxlength: [100, "Full name cannot exceed 100 characters."],
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email cannot exceed 254 characters."],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    passwordHash: {
      type: String,
      required: [true, "Password hash is required."],
      select: false,
    },

    role: {
      type: String,
      required: true,
      enum: ["talent", "organization", "admin", "sponsor", "mentor"],
      immutable: true,
    },

    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Normalize email before Mongoose validation and persistence.
userSchema.pre("validate", function () {
  if (typeof this.email === "string") {
    this.email = this.email.trim().toLowerCase();
  }
});

const User = mongoose.model("User", userSchema);

export default User;
