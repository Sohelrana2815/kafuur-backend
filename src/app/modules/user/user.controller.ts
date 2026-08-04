import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { UserServices } from "./user.service.js";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.CREATED,
    success: true,
    message: "User Created Successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "All Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// --- 1. CUSTOMER CONTROLLER ---
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  // Extract userId directly from the authenticated token payload
  const userId = (req.user as JwtPayload)?.userId;
  const payload = req.body;

  const result = await UserServices.updateMyProfile(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

// --- 2. ADMIN CONTROLLER ---
const updateUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  // Extract userId from the URL parameters
  const userId = req.params.id as string;
  const payload = req.body;

  const result = await UserServices.updateUserByAdmin(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "User updated successfully by Admin",
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  updateMyProfile,
  updateUserByAdmin,
};
