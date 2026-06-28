/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js"; // Matches your global runtime catch wrapper
import { sendResponse } from "../../utils/sendResponse.js"; // Matches your standardized API response blueprint
// import { ProductServices } from "./product.service.js";
import httpStatus from "http-status-codes";
import { ProductServices } from "./product.service.js";
import AppError from "../../errorsHelpers/AppError.js";

const createProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // req.body is now fully formatted and validated by Zod!
    // console.log("From Next.js server action: ", req.body);
    const result = await ProductServices.createProduct(req.body);

    sendResponse(res, {
      statusCode: httpStatus.StatusCodes.CREATED,
      success: true,
      message: "Product Created Successfully",
      data: result,
    });
  },
);

const getAllProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Pass req.query down to your service layer so the Query Builder can extract it
    const result = await ProductServices.getAllProducts(req.query);

    sendResponse(res, {
      statusCode: httpStatus.StatusCodes.OK,
      success: true,
      message: "Products retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const updateProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      throw new AppError(
        httpStatus.StatusCodes.BAD_REQUEST,
        "A valid Product ID string is required in the URL parameter.",
      );
    }

    // req.body perfectly flows into your strictly-typed service function contract
    const result = await ProductServices.updateProduct(id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.StatusCodes.OK,
      success: true,
      message: "Product Updated Successfully",
      data: result,
    });
  },
);

const getSingleProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Extract 'slug' because your route is /:slug
    const { slug } = req.params; 

    if (!slug || typeof slug !== "string") {
      throw new AppError(
        httpStatus.StatusCodes.BAD_REQUEST,
        "A valid Product Slug is required in the URL parameter.",
      );
    }

    // 2. Pass the slug value directly to your service function
    const result = await ProductServices.getSingleProduct(slug);
    
    sendResponse(res, {
      statusCode: httpStatus.StatusCodes.OK,
      success: true,
      message: "Product details retrieved successfully",
      data: result,
    });
  },
);
const getProductById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      throw new AppError(
        httpStatus.StatusCodes.BAD_REQUEST,
        "A valid Product ID string is required in the URL parameter.",
      );
    }

    const result = await ProductServices.getProductById(id);
    sendResponse(res, {
      statusCode: httpStatus.StatusCodes.OK,
      success: true,
      message: "Product details retrieved successfully",
      data: result,
    });
  },
);

const deleteProducts = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;

    const result = await ProductServices.deleteProducts(ids);

    sendResponse(res, {
      statusCode: httpStatus.StatusCodes.OK,
      success: true,
      message: `${result.count} Product(s) successfully soft-deleted.`,
      data: null,
    });
  },
);

export const ProductControllers = {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProducts,
  getProductById,
  getSingleProduct
};
