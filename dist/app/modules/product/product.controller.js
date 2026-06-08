import { catchAsync } from "../../utils/catchAsync.js"; // Matches your global runtime catch wrapper
import { sendResponse } from "../../utils/sendResponse.js"; // Matches your standardized API response blueprint
// import { ProductServices } from "./product.service.js";
import httpStatus from "http-status-codes";
import { ProductServices } from "./product.service.js";
import AppError from "../../errorsHelpers/AppError.js";
const createProduct = catchAsync(
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async (req, res, next) => {
    // req.body is now fully formatted and validated by Zod!
    const result = await ProductServices.createProduct(req.body);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.CREATED,
        success: true,
        message: "Product Created Successfully",
        data: result,
        // data: {},
    });
});
const getAllProducts = catchAsync(async (req, res, next) => {
    const result = await ProductServices.getAllProducts();
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Products retrieved successfully",
        data: result,
    });
});
const updateProduct = catchAsync(
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async (req, res, next) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
        throw new AppError(httpStatus.StatusCodes.BAD_REQUEST, "A valid Product ID string is required in the URL parameter.");
    }
    const result = await ProductServices.updateProduct(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Product Updated Successfully",
        data: result,
    });
});
const deleteProducts = catchAsync(
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async (req, res, next) => {
    const { ids } = req.body;
    const result = await ProductServices.deleteProducts(ids);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: `${result.count} Product(s) successfully soft-deleted.`,
        data: null,
    });
});
export const ProductControllers = {
    createProduct,
    getAllProducts,
    updateProduct,
    deleteProducts,
};
