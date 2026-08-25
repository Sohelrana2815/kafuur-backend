// import { Prisma } from "@prisma/client";
import AppError from "../../errorsHelpers/AppError.js";
import httpStatus from "http-status-codes";
import prisma from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import { createNewAccessTokenWithRefreshToken,
// createUserTokens,
 } from "../../utils/userTokens.js";
import { envVars } from "../../config/env.js";
// const credentialsLogin = async (
//   payload: Pick<Prisma.UserCreateInput, "email" | "password">,
// ) => {
//   const { email, password } = payload;
//   if (!password) {
//     throw new AppError(
//       httpStatus.StatusCodes.BAD_REQUEST,
//       "Password is required to authenticate.",
//     );
//   }
//   const user = await prisma.user.findUnique({ where: { email } });
//   if (!user || !user.password) {
//     throw new AppError(
//       httpStatus.StatusCodes.UNAUTHORIZED,
//       "Account does not exists",
//     );
//   }
//   const isPasswordMatch = await bcrypt.compare(password, user.password);
//   if (!isPasswordMatch) {
//     throw new AppError(
//       httpStatus.StatusCodes.UNAUTHORIZED,
//       "Invalid credentials",
//     );
//   }
//   // const jwtPayload = {
//   //   userId: user.id,
//   //   email: user.email,
//   //   role: user.role,
//   // };
//   // const accessToken = generateToken(
//   //   jwtPayload,
//   //   envVars.JWT_ACCESS_SECRET,
//   //   envVars.JWT_ACCESS_EXPIRES_IN,
//   // );
//   // const refreshToken = generateToken(
//   //   jwtPayload,
//   //   envVars.JWT_REFRESH_SECRET,
//   //   envVars.JWT_REFRESH_EXPIRES_IN,
//   // );
//   const userTokens = createUserTokens(user);
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
//   const { password: _, ...userWithoutPassword } = user;
//   return {
//     accessToken: userTokens.accessToken,
//     refreshToken: userTokens.refreshToken,
//     user: userWithoutPassword,
//   };
// };
const getNewAccessToken = async (refreshToken) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);
    return {
        accessToken: newAccessToken,
    };
};
const changePassword = async (oldPassword, newPassword, decodedToken) => {
    const userId = decodedToken?.userId;
    // User must need to logged in first to change their password
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
    if (!user) {
        throw new AppError(httpStatus.StatusCodes.UNAUTHORIZED, "You must be logged in to change your password");
    }
    // Handle Google OAuth users who don't have a password set
    if (!user.password) {
        throw new AppError(httpStatus.StatusCodes.BAD_REQUEST, "This account was created via Google. Please login with Google first and set a password then you can change your password.");
    }
    // Compare the user input password to Stored Database password
    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user?.password);
    if (!isOldPasswordMatch) {
        throw new AppError(httpStatus.StatusCodes.UNAUTHORIZED, "Old Password does not match");
    }
    // If user give the valid old password then set the new password to DB
    // Hash the new password
    const newHashedPassword = await bcrypt.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));
    // PERSIST TO DATABASE IN POSTGRESQL
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: newHashedPassword,
        },
    });
};
export const AuthServices = {
    // credentialsLogin,
    getNewAccessToken,
    changePassword
};
