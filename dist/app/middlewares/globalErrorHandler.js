import { envVars } from "../config/env.js";
import httpStatus from "http-status-codes";
import { ZodError } from "zod";
import { handleZodError } from "../errors/handleZodError.js";
import AppError from "../errorsHelpers/AppError.js";
import { deleteImageFromCloudinary } from "../config/cloudinary.config.js";
// Global err handler
export const globalErrorHandler = async (err, req, res, next) => {
    // if (req.file) {
    //   await deleteImageFromCloudinary(req.file.path);
    // }
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const imageUrls = req.files.map((file) => file.path);
        await Promise.all(imageUrls.map((url) => deleteImageFromCloudinary(url)));
    }
    // 1. Defaults
    let statusCode = httpStatus.StatusCodes.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong!";
    let errorSource = [{ path: "", message: "Something went wrong!" }];
    // 2. Refine based on Error Type (Use else if to prevent overwriting)
    if (err instanceof ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSource = simplifiedError.errorSource;
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errorSource = [{ path: "", message: err.message }];
    }
    else if (err instanceof Error) {
        message = err.message;
        errorSource = [{ path: "", message: err.message }];
    }
    // 3. Send Response
    return res.status(statusCode).json({
        success: false,
        message, // Use the refined message variable
        statusCode,
        errorSource,
        stack: envVars.NODE_ENV === "development" ? err.stack : null,
    });
};
