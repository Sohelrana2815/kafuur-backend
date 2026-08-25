import { catchAsync } from "../../utils/catchAsync.js"; // Uses your exact catchAsync utility 
import httpStatus from "http-status-codes";
import { AdminAuthServices } from "./adminAuth.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
const createAdmin = catchAsync(async (req, res) => {
    const result = await AdminAuthServices.createAdmin(req.body);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.CREATED,
        success: true,
        message: "New Administrator Account Spawned Successfully",
        data: result,
    });
});
// const loginAdmin = catchAsync(async (req: Request, res: Response) => {
//     const result = await AdminAuthServices.loginAdmin(req.body);
//     const { accessToken, admin } = result;
//     // Set Access Token in HTTP-Only Cookie exactly like your core configurations 
//     res.cookie("accessToken", accessToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 15 * 60 * 1000, // 15 minutes [cite: 113]
//     });
//     sendResponse(res, {
//         statusCode: httpStatus.StatusCodes.OK,
//         success: true,
//         message: "Admin logged in successfully!",
//         data: {
//             accessToken,
//             admin,
//         },
//     });
// });
export const AdminAuthControllers = {
    createAdmin,
    // loginAdmin,
};
