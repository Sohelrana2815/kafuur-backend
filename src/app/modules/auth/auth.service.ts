import AppError from "../../errorsHelpers/AppError.js";
import httpStatus from "http-status-codes";
import prisma from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import {
  createNewAccessTokenWithRefreshToken,
} from "../../utils/userTokens.js";
import { envVars } from "../../config/env.js";
import { CustomJwtPayload } from "./auth.interface.js";


const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};


const changePassword = async (oldPassword: string, newPassword: string, decodedToken: CustomJwtPayload) => {
  const userId = decodedToken?.userId;
  // User must need to logged in first to change their password
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  if (!user) {
    throw new AppError(httpStatus.StatusCodes.UNAUTHORIZED, "You must be logged in to change your password");
  }
  // Handle Google OAuth users who don't have a password set

  if (!user.password) {
    throw new AppError(httpStatus.StatusCodes.BAD_REQUEST,
      "This account was created via Google. Please login with Google first and set a password then you can change your password.");
  }

  // Compare the user input password to Stored Database password
  const isOldPasswordMatch = await bcrypt.compare(oldPassword, user?.password as string)
  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.StatusCodes.UNAUTHORIZED, "Old Password does not match");
  }
  // If user give the valid old password then set the new password to DB
  // Hash the new password
  const newHashedPassword = await bcrypt.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );
  // PERSIST TO DATABASE IN POSTGRESQL
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: newHashedPassword,
    },
  });


}

export const AuthServices = {
  getNewAccessToken,
  changePassword
};
