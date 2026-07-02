import AppError from "../../errorsHelpers/AppError.js";
import httpStatus from "http-status-codes";
import prisma from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt.js";
import { envVars } from "../../config/env.js";
const credentialsLogin = async (payload) => {
    const { email, password } = payload;
    if (!password) {
        throw new AppError(httpStatus.StatusCodes.BAD_REQUEST, "Password is required to authenticate.");
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        throw new AppError(httpStatus.StatusCodes.UNAUTHORIZED, "Account does not exists");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new AppError(httpStatus.StatusCodes.UNAUTHORIZED, "Invalid login credentials");
    }
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES_IN);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return {
        accessToken,
        user: userWithoutPassword,
    };
};
export const AuthServices = {
    credentialsLogin,
};
