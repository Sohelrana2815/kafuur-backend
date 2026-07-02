import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { UserServices } from "./user.service.js";
import httpStatus from "http-status-codes";

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

export const UserControllers = {
  createUser,
  getAllUsers,
};
