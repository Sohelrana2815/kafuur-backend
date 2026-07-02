import { catchAsync } from "../../utils/catchAsync.js";
import { AuthServices } from "./auth.service.js";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
const credentialsLogin = catchAsync(async (req, res) => {
    const result = await AuthServices.credentialsLogin(req.body);
    const { accessToken, user } = result;
    // Set Access Token in HTTP-Only Cookie exactly like your core configurations
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 60 * 1000, // 1 day
    });
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Administrative Dashboard Authorization Successful",
        data: {
            accessToken,
            user,
        },
    });
});
export const AuthControllers = {
    credentialsLogin,
};
