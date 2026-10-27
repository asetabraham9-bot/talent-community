
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import { hashPassword } from "../src/utils/password.util.js";

dotenv.config();

const ADMIN = {
  fullName: "Asayehu Abraham",
  email: "asayehuadmin@gmail.com",
  password: "asayehuadmin@123",
};

async function createAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from your .env file.");
    }

    await connectDB();

    const email = ADMIN.email.trim().toLowerCase();

    // Prevent duplicate accounts.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`An account already exists for ${email}.`);
      console.log("No changes were made.");
      return;
    }

    // Only allow this script to create the first admin.
    const adminExists = await User.exists({ role: "admin" });

    if (adminExists) {
      console.log("An admin account already exists.");
      console.log("No changes were made.");
      return;
    }

    const passwordHash = await hashPassword(ADMIN.password);

    const admin = await User.create({
      fullName: ADMIN.fullName,
      email,
      passwordHash,
      role: "admin",
      status: "active",
      isEmailVerified: true,
    });

    console.log("\nAdmin account created successfully!");
    console.log(`Name: ${admin.fullName}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Admin ID: ${admin._id}`);
    console.log("Password stored as a bcrypt hash.");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

await createAdmin();
