import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User, { Role, Status } from "./models/userModel";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL!);

    const existingAdmin = await User.findOne({ roles: Role.ADMIN });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      fullname: "System Admin",
      email: "admin@system.com",
      password: hashedPassword,
      roles: [Role.ADMIN],
      approved: Status.APPROVED
    });

    console.log("Admin created successfully");
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
