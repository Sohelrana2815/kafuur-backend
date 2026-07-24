/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status-codes";
import { OrderServices } from "./order.service.js";

const createOrder = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response) => {
    const result = await OrderServices.createOrder(req.body);

    sendResponse(res, {
      statusCode: httpStatus.StatusCodes.CREATED,
      success: true,
      message: "Order placed successfully!",
      data: result,
    });
  },
);

const getAllOrders = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderServices.getAllOrders();

    sendResponse(res, {
      statusCode: httpStatus.StatusCodes.OK,
      success: true,
      message: "Orders retrieved successfully",
      data: result,
    });
  },
);

export const OrderControllers = {
  createOrder,
  getAllOrders,
};
