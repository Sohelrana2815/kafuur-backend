/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";
import { userSearchableFields } from "./user.constant.js";
import AppError from "../../errorsHelpers/AppError.js";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import { envVars } from "../../config/env.js";

const createUser = async (payload: Prisma.UserCreateInput) => {
  const duplicateUser = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (duplicateUser) {
    throw new AppError(httpStatus.StatusCodes.CONFLICT, "User Already Exists");
  }

  if (!payload.password) {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      "Password is required to register an account",
    );
  }

  const saltRounds = Number(envVars.BCRYPT_SALT_ROUND) || 10;
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

  const user = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
      auths: {
        create: {
          provider: "credentials",
          providerId: payload.email,
        },
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const getAllUsers = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.user, {
    ...query,
  });
  const usersQuery = queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();
  // Concurrently fetch catalog payload data and total counter metadata
  const [data, meta] = await Promise.all([
    usersQuery.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    data,
    meta,
  };
};

const updateMyProfile = async (
  userId: string,
  payload: Prisma.UserUpdateInput,
) => {
  /**
   * Email cannot update
   * name, phone, password, address, city, thana can be updated
   * password re-hashing after update
   * only admin can update role, isDeleted, statuses
   * User role update customer --> admin (Only admin can update role)
   */

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new AppError(httpStatus.StatusCodes.NOT_FOUND, "User not found");
  }

  // Prevent users from elevating their own privileges or changing system statuses
  const restrictedFields = [
    "role",
    "status",
    "isVerified",
    "isDeleted",
    "email",
  ];
  const hasRestrictedFields = restrictedFields.some((field) =>
    Object.keys(payload).includes(field),
  );
  if (hasRestrictedFields) {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      "You cannot update restricted fields",
    );
  }
  // Hash password if they are updating it

  if (payload.password) {
    const saltRounds = Number(envVars.BCRYPT_SALT_ROUND) || 10;
    payload.password = await bcrypt.hash(
      payload.password as string,
      saltRounds,
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

// --- 2. ADMIN UPDATING ANY USER ---

const updateUserByAdmin = async (
  userId: string,
  payload: Prisma.UserUpdateInput,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new AppError(httpStatus.StatusCodes.NOT_FOUND, "User not found");
  }

  // Even admins shouldn't usually change a user's unique login email to prevent auth conflicts
  if (payload.email) {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      "Email address cannot be updated",
    );
  }
  if (payload.password) {
    const saltRounds = Number(envVars.BCRYPT_SALT_ROUND) || 10;
    payload.password = await bcrypt.hash(
      payload.password as string,
      saltRounds,
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateMyProfile,
  updateUserByAdmin,
};
