import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { CustomJwtPayload } from "../auth/auth.interface.js";
import AppError from "../../errorsHelpers/AppError.js";
import { CartServices } from "./cart.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { JwtPayload } from "jsonwebtoken";

const getCart = catchAsync(async (req: Request, res: Response) => {
  const userId =
    (req.user as CustomJwtPayload)?.id ||
    (req.user as CustomJwtPayload)?.userId;
  if (!userId) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "User identity missing",
    );
  }
  // --- THE FIX STARTS HERE ---
  // Parse comma-separated IDs if provided in the URL: ?ids=id1,id2
  const cartItemIds = req.query.ids
    ? (req.query.ids as string).split(",")
    : undefined;

  // Pass the extracted array as the second argument
  const result = await CartServices.getCart(userId, cartItemIds);
  // --- THE FIX ENDS HERE ---

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Cart retrieved successfully",
    data: result,
  });
});
const getOrderSummary = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload)?.userId;

  if (!userId) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "You are not authorized",
    );
  }
  const idsParam = req.query.ids;

  if (!idsParam || typeof idsParam !== "string") {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      "Cart item IDs are required",
    );
  }

  const cartItemIds = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const result = await CartServices.getOrderSummary(userId, cartItemIds);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Order summary calculated successfully",
    data: result,
  });
});

const addToCart = catchAsync(async (req: Request, res: Response) => {
  // Extract user ID mapped globally on the Request object
  const userId = (req.user as JwtPayload)?.userId;
  if (!userId) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "You are not authorized",
    );
  }

  const { productId } = req.body;
  const result = await CartServices.addToCart(userId, productId);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Add to cart successfully",
    data: result,
  });
});
const incrementCartItem = catchAsync(async (req: Request, res: Response) => {
  // Extract user ID mapped globally on the Request object
  const userId = (req.user as JwtPayload)?.userId;
  if (!userId) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "You are not authorized",
    );
  }

  const { productId } = req.body;
  const result = await CartServices.incrementCartItem(userId, productId);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Increment successfully",
    data: result,
  });
});
const decrementCartItem = catchAsync(async (req: Request, res: Response) => {
  // Extract user ID mapped globally on the Request object
  const userId = (req.user as JwtPayload)?.userId;
  if (!userId) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "You are not authorized",
    );
  }

  const { productId } = req.body;
  const result = await CartServices.decrementCartItem(userId, productId);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Decrement successfully",
    data: result,
  });
});

// const updateCartItem = catchAsync(async (req: Request, res: Response) => {
//   // Extract user ID mapped globally on the Request object
//   const userId = (req.user as JwtPayload)?.userId;
//   if (!userId) {
//     throw new AppError(
//       httpStatus.StatusCodes.UNAUTHORIZED,
//       "You are not authorized",
//     );
//   }

//   const { productId, quantity } = req.body;
//   const result = await CartServices.updateCartItem(userId, productId, quantity);

//   sendResponse(res, {
//     statusCode: httpStatus.StatusCodes.OK,
//     success: true,
//     message:
//       quantity <= 0 ? "Item removed from cart" : "Cart updated successfully",
//     data: result,
//   });
// });

// const syncCart = catchAsync(async (req: Request, res: Response) => {
//   const userId =
//     (req.user as CustomJwtPayload)?.id ||
//     (req.user as CustomJwtPayload)?.userId;
//   if (!userId) {
//     throw new AppError(
//       httpStatus.StatusCodes.UNAUTHORIZED,
//       "User identity missing",
//     );
//   }

//   const { items } = req.body;
//   const result = await CartServices.syncCart(userId, items);

//   sendResponse(res, {
//     statusCode: httpStatus.StatusCodes.OK,
//     success: true,
//     message: "Guest cart successfully merged",
//     data: result,
//   });
// });

// const deleteCartItems = catchAsync(async (req: Request, res: Response) => {
//   const userId =
//     (req.user as CustomJwtPayload)?.id ||
//     (req.user as CustomJwtPayload)?.userId;
//   if (!userId) {
//     throw new AppError(
//       httpStatus.StatusCodes.UNAUTHORIZED,
//       "User identity missing",
//     );
//   }

//   const { ids } = req.body; // Expecting { ids: ["id1", "id2"] } or { ids: ["id1"] }
//   const result = await CartServices.deleteCartItems(ids, userId);

//   sendResponse(res, {
//     statusCode: httpStatus.StatusCodes.OK,
//     success: true,
//     message: `${result.count} item(s) removed from cart successfully`,
//     data: null,
//   });
// });

const deleteSingleCartItem = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // Captures the single ID from the URL
  const userId = req.user?.id as string; // Extracted from auth middleware

  await CartServices.deleteSingleCartItem(id as string, userId);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Cart item deleted successfully",
    data: null,
  });
});
export const CartControllers = {
  addToCart,
  incrementCartItem,
  decrementCartItem,
  // updateCartItem,
  // syncCart,
  getCart,
  getOrderSummary,
  // deleteCartItems,
  deleteSingleCartItem,
};
