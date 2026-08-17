import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js"; // Matches your global runtime catch wrapper
import { sendResponse } from "../../utils/sendResponse.js"; // Matches your standardized API response blueprint
// import { ProductServices } from "./product.service.js";
import httpStatus from "http-status-codes";
import { ProductServices } from "./product.service.js";
import AppError from "../../errorsHelpers/AppError.js";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  // req.body is now fully formatted and validated by Zod!
  // console.log("From Next.js server action: ", req.body);
  const result = await ProductServices.createProduct(req.body);
  console.log("From product controller:", req.body);
  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.CREATED,
    success: true,
    message: "Product Created Successfully",
    data: result,
    // data: null, // Placeholder until service layer is implemented
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  // Pass req.query down to your service layer so the Query Builder can extract it
  const result = await ProductServices.getAllProducts(req.query);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Products retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
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
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
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
});
const getProductById = catchAsync(async (req: Request, res: Response) => {
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
});

const deleteProducts = catchAsync(async (req: Request, res: Response) => {
  const { ids } = req.body;

  const result = await ProductServices.deleteProducts(ids);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: `${result.count} Product(s) successfully soft-deleted.`,
    data: null,
  });
});
const deleteProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const result = await ProductServices.deleteProductById(id);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Product successfully deleted.",
    data: result,
  });
});

const softDeleteProductById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

   const result =  await ProductServices.softDeleteProductById(id);

    sendResponse(res, {
      statusCode: httpStatus.StatusCodes.OK,
      success: true,
      message: "Product successfully deleted.",
      data: result,
    });
  }
);
export const ProductControllers = {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProducts,
  deleteProductById,
  softDeleteProductById,
  getProductById,
  getSingleProduct,
};
