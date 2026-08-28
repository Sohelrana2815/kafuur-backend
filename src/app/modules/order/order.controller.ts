/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorsHelpers/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { OrderServices } from "./order.service.js";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  // Utilizing your clean global Express interface
  const userId = (req.user as JwtPayload)?.userId;
  console.log(userId, req.body, "From controller");
  if (!userId) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "You are not authorized",
    );
  }

  const result = await OrderServices.createOrder(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.CREATED,
    success: true,
    message: result.paymentUrl
      ? "Order pending. Redirecting to payment gateway..."
      : "Order placed successfully!",
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.getAllOrders();

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Orders retrieved successfully",
    data: result,
  });
});

// Get my orders

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload)?.userId;
  const result = await OrderServices.getMyOrders(userId);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Orders retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = req.user as JwtPayload;

  const result = await OrderServices.getOrderById(id as string, user);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Order details retrieved successfully.",
    data: result,
  });
});

export const OrderControllers = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
};
