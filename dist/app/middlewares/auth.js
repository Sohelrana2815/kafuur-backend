import AppError from "../errorsHelpers/AppError.js";
import httpStatus from "http-status-codes";
import { verifyToken } from "../utils/jwt.js";
import { envVars } from "../config/env.js";
const auth = (...requiredRoles) => {
    return async (req, res, next) => {
        try {
            // 1. Get token from cookies
            // const token = req.cookies.accessToken;
            const token = req.cookies.accessToken;
            if (!token) {
                throw new AppError(httpStatus.StatusCodes.UNAUTHORIZED, "You are not authorized!");
            }
            // 2. Verify token
            const decoded = verifyToken(token, envVars.JWT_ACCESS_SECRET);
            if (!decoded) {
                throw new AppError(httpStatus.StatusCodes.UNAUTHORIZED, "Token is invalid or expired");
            }
            // 3. Check Roles (Authorization)
            // If you passed "ADMIN" to auth(), this checks if decoded.role === "ADMIN"
            if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
                throw new AppError(httpStatus.StatusCodes.FORBIDDEN, "You do not have the required permissions");
            }
            // 4. Success - Attach user to request and move to Controller
            req.user = decoded;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
export default auth;
