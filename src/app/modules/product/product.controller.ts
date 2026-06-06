import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js"; // Matches your global runtime catch wrapper
import { sendResponse } from "../../utils/sendResponse.js"; // Matches your standardized API response blueprint
// import { ProductServices } from "./product.service.js";
import httpStatus from "http-status-codes";
import { ProductServices } from "./product.service.js";
import AppError from "../../errorsHelpers/AppError.js";
import { Product } from "@prisma/client";

const createProduct = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: Product = {
      ...req.body,
      images: (req.files as Express.Multer.File[]).map((file) => file.path),
    };
    // Pass clean object to service
    const result = await ProductServices.createProduct(payload);

    sendResponse(res, {
      statusCode: httpStatus.StatusCodes.CREATED,
      success: true,
      message: "Product Created Successfully",
      data: result,
      // data: {},
    });
  },
);

const updateProduct = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      throw new AppError(
        httpStatus.StatusCodes.BAD_REQUEST,
        "A valid Product ID string is required in the URL parameter.",
      );
    }

    const result = await ProductServices.updateProduct(id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.StatusCodes.OK,
      success: true,
      message: "Product Updated Successfully",
      data: result,
    });
  },
);

export const ProductControllers = {
  createProduct,
  updateProduct,
};
