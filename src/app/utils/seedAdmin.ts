// import { AuthProvider } from "@prisma/client";
import { Role } from "@prisma/client";
import { envVars } from "../config/env.js";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const seedAdmin = async () => {
  try {
    // 1. Check if an admin already exists
    const adminExists = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (adminExists) {
      return;
    }

    // 2. Hashed password
    const saltRounds = Number(envVars.BCRYPT_SALT_ROUND) || 10;

    const hashedPassword = await bcrypt.hash(
      envVars.ADMIN_PASSWORD,
      saltRounds,
    );

    // 3. Create Admin

    await prisma.user.create({
      data: {
        username: "Admin",
        email: envVars.ADMIN_EMAIL,
        password: hashedPassword,
        role: Role.ADMIN,
        isVerified: true,
        auths: {
          create: {
            provider: "credentials",
            providerId: envVars.ADMIN_EMAIL,
          },
        },
      },
    });

  } catch (error) {
    console.error("❌ Error seeding admin:", error);
  }
};
