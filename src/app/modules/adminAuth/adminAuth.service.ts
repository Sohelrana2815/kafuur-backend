import { Prisma, Role } from "@prisma/client";
import prisma from "../../lib/prisma.js"; // Uses your exact central Prisma instance
import AppError from "../../errorsHelpers/AppError.js"; // Matches your error handling
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import { envVars } from "../../config/env.js";
import { generateToken } from "../../utils/jwt.js"; // Leverages your custom jwt helper
import { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
/**
 * Creates internal token payloads and maps sessions down to the database
 */
const createAdminAuthTokens = async (user: JwtPayload) => {
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role, // This will explicitly hold Role.ADMIN
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES_IN || "15m",
  );

  return { accessToken };
};

/**
 * Registers an internal administrative member (Guarded Route)
 */
const registerAdmin = async (payload: Prisma.UserCreateInput) => {
  const duplicateAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: payload.email }, { username: payload.username }],
    },
  });

  if (duplicateAdmin) {
    throw new AppError(
      httpStatus.StatusCodes.CONFLICT,
      "An administrative account with this email or username already exists",
    );
  }
  // 1. Add this Guard Clause to satisfy TypeScript and protect your backend
  if (!payload.password) {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      "A password is required to register an administrative account.",
    );
  }

  const saltRounds = Number(envVars.BCRYPT_SALT_ROUND) || 10; // Matches your hashing salt extraction [cite: 83]
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds); // Hashing execution [cite: 84]

  const result = await prisma.user.create({
    data: {
      ...payload,
      id: crypto.randomUUID(),
      password: hashedPassword,
      role: Role.ADMIN, // Explicitly lock registration privileges to ADMIN status
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...adminWithoutPassword } = result; // Strip hash from payload [cite: 85]
  return adminWithoutPassword;
};

/**
 * Validates credentials locally without relying on passport strategies
 */
const loginAdmin = async (
  payload: Pick<Prisma.UserCreateInput, "email" | "password">,
) => {
  const { email, password } = payload;
  // 1. Guard clause: Ensure a password was actually sent in the login request payload
  if (!password) {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      "Password is required to authenticate.",
    );
  }

  const adminUser = await prisma.user.findUnique({
    where: { email },
  });

  // 2. Security optimization: validation failure if account does not exist,
  // lacks admin privileges, OR if it somehow doesn't have a hashed password.
  if (!adminUser || adminUser.role !== Role.ADMIN || !adminUser.password) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "Invalid administrative login credentials",
    );
  }
  const isPasswordMatch = await bcrypt.compare(password, adminUser.password);

  if (!isPasswordMatch) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "Invalid administrative login credentials",
    );
  }

  const { accessToken } = await createAdminAuthTokens(adminUser);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...adminWithoutPassword } = adminUser;

  return {
    accessToken,
    admin: adminWithoutPassword,
  };
};


export const AdminAuthServices = {
  registerAdmin,
  loginAdmin,

};
