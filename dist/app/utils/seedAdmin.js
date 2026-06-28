// import { AuthProvider } from "@prisma/client";
import { Role } from "@prisma/client";
import { envVars } from "../config/env.js";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import crypto from "crypto"; // 1. Import crypto
export const seedAdmin = async () => {
    try {
        // 1. Check if an admin already exists
        const adminExists = await prisma.user.findFirst({
            where: { role: "ADMIN" },
        });
        if (adminExists) {
            console.log("Admin record already exists. Skipping seed.");
            return;
        }
        // 2. Hashed password
        const saltRounds = Number(envVars.BCRYPT_SALT_ROUND) || 10;
        const hashedPassword = await bcrypt.hash(envVars.ADMIN_PASSWORD, saltRounds);
        // 3. Create Admin
        await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                username: "Admin",
                email: envVars.ADMIN_EMAIL,
                password: hashedPassword,
                role: Role.ADMIN,
                // provider: [AuthProvider.CREDENTIALS],
            },
        });
        console.log("✅ Admin user created successfully!");
    }
    catch (error) {
        console.error("❌ Error seeding admin:", error);
    }
};
