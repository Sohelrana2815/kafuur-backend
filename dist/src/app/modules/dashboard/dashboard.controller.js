import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status-codes";
import { DashboardServices } from "./dashboard.service.js";
const getAdminDashboard = catchAsync(async (req, res) => {
    const result = await DashboardServices.getAdminDashboard();
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Admin dashboard data retrieved successfully",
        data: result,
    });
});
const getCustomerDashboard = catchAsync(async (req, res) => {
    // Extract userId from your auth middleware's attached user object
    const userId = req.user?.userId;
    const result = await DashboardServices.getCustomerDashboard(userId);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Customer dashboard data retrieved successfully",
        data: result,
    });
});
export const DashboardControllers = {
    getAdminDashboard,
    getCustomerDashboard,
};
