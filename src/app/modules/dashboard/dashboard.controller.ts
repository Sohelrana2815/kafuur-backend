import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status-codes";
import { DashboardServices } from "./dashboard.service.js";
import { JwtPayload } from "jsonwebtoken";

const getAdminDashboard = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardServices.getAdminDashboard();

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Admin dashboard data retrieved successfully",
    data: result,
  });
});

const getCustomerDashboard = catchAsync(async (req: Request, res: Response) => {
  // Extract userId from your auth middleware's attached user object
  const userId = (req.user as JwtPayload)?.userId;

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
