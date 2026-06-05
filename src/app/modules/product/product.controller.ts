import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js"; // Matches your global runtime catch wrapper 
import { sendResponse } from "../../utils/sendResponse.js"; // Matches your standardized API response blueprint 
// import { ProductServices } from "./product.service.js";
import httpStatus from "http-status-codes";

const createProduct = catchAsync(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (req: Request, res: Response, next: NextFunction) => {
        // Send incoming request body directly down to the business engine layer
        // const result = await ProductServices.createProduct(req.body);
        console.log({
            files: req.files,
            body: req.body
        });

        sendResponse(res, {
            statusCode: httpStatus.StatusCodes.CREATED,
            success: true,
            message: "Product Created Successfully",
            // data: result,
            data: {},
        });
    }
);

export const ProductControllers = {
    createProduct,
};