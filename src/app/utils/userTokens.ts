import { User, UserStatus } from "@prisma/client";
import { generateToken, verifyToken } from "./jwt.js";
import { envVars } from "../config/env.js";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import AppError from "../errorsHelpers/AppError.js";
import httpStatus from "http-status-codes";

type TokenUser = Pick<User, "id" | "email" | "role">;

export const createUserTokens = (user: TokenUser) => {
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES_IN,
  );
  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES_IN,
  );
  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string,
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET,
  ) as JwtPayload;
  const user = await prisma.user.findUnique({
    where: { email: verifiedRefreshToken.email },
  });
  if (!user) {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      "User does not exist",
    );
  }
  if (user.status === UserStatus.BANNED || user.status === UserStatus.BLOCKED) {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      `User is ${user.status}`,
    );
  }

  if (user.status === UserStatus.DELETED) {
    throw new AppError(httpStatus.StatusCodes.BAD_REQUEST, `User is deleted`);
  }

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  
  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES_IN,
  );
  return accessToken;
};
