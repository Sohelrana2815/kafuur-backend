import { catchAsync } from "../../utils/catchAsync.js"; // Uses your exact catchAsync utility 
import httpStatus from "http-status-codes";
import { AdminAuthServices } from "./adminAuth.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
const registerAdmin = catchAsync(async (req, res) => {
    const result = await AdminAuthServices.registerAdmin(req.body);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.CREATED,
        success: true,
        message: "New Administrator Account Spawned Successfully",
        data: result,
    });
});
const loginAdmin = catchAsync(async (req, res) => {
    const result = await AdminAuthServices.loginAdmin(req.body);
    const { accessToken, admin } = result;
    // Set Access Token in HTTP-Only Cookie exactly like your core configurations 
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes [cite: 113]
    });
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Administrative Dashboard Authorization Successful",
        data: {
            accessToken,
            admin,
        },
    });
});
export const AdminAuthControllers = {
    registerAdmin,
    loginAdmin,
};
