import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { CustomJwtPayload } from "../auth/auth.interface.js";
import AppError from "../../errorsHelpers/AppError.js";
import { CartServices } from "./cart.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/catchAsync.js";

const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  // Extract user ID mapped globally on the Request object
  const userId = (req.user as CustomJwtPayload)?.id || (req.user as CustomJwtPayload)?.userId;
  if (!userId) {
    throw new AppError(httpStatus.StatusCodes.UNAUTHORIZED, "User identity missing");
  }

  const { productId, quantity } = req.body;
  const result = await CartServices.updateCartItem(userId, productId, quantity);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: quantity <= 0 ? "Item removed from cart" : "Cart updated successfully",
    data: result,
  });
});

const syncCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as CustomJwtPayload)?.id || (req.user as CustomJwtPayload)?.userId;
  if (!userId) {
    throw new AppError(httpStatus.StatusCodes.UNAUTHORIZED, "User identity missing");
  }

  const { items } = req.body;
  const result = await CartServices.syncCart(userId, items);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Guest cart successfully merged",
    data: result,
  });
});

const getCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as CustomJwtPayload)?.id || (req.user as CustomJwtPayload)?.userId;
  if (!userId) {
    throw new AppError(httpStatus.StatusCodes.UNAUTHORIZED, "User identity missing");
  }

  const result = await CartServices.getCart(userId);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Cart retrieved successfully",
    data: result,
  });
});

export const CartControllers = {
  updateCartItem,
  syncCart,
  getCart,
};