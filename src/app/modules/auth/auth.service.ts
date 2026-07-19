import { Prisma } from "@prisma/client";
import AppError from "../../errorsHelpers/AppError.js";
import httpStatus from "http-status-codes";
import prisma from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens.js";

const credentialsLogin = async (
  payload: Pick<Prisma.UserCreateInput, "email" | "password">,
) => {
  const { email, password } = payload;
  if (!password) {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      "Password is required to authenticate.",
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "Account does not exists",
    );
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "Invalid login credentials",
    );
  }

  // const jwtPayload = {
  //   userId: user.id,
  //   email: user.email,
  //   role: user.role,
  // };
  // const accessToken = generateToken(
  //   jwtPayload,
  //   envVars.JWT_ACCESS_SECRET,
  //   envVars.JWT_ACCESS_EXPIRES_IN,
  // );

  // const refreshToken = generateToken(
  //   jwtPayload,
  //   envVars.JWT_REFRESH_SECRET,
  //   envVars.JWT_REFRESH_EXPIRES_IN,
  // );

  const userTokens = createUserTokens(user);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = user;
  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: userWithoutPassword,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};

export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
};
