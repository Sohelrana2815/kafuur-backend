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

export const UserServices = {
  createUser,

  getAllUsers,
};



// const credentialsLogin = async (payload: Partial<IUser>) => {
//     const { email, password } = payload;

//     const isUserExist = await User.findOne({ email })

//     if (!isUserExist) {
//         throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist")
//     }

//     const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

//     if (!isPasswordMatched) {
//         throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
//     }
//     const jwtPayload = {
//         userId: isUserExist._id,
//         email: isUserExist.email,
//         role: isUserExist.role
//     }
//     const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

//     return {
//         accessToken
//     }

// }

// //user - login - token (email, role, _id) - booking / payment / booking / payment cancel - token 

// export const AuthServices = {
//     credentialsLogin
// }