import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status-codes";
import { ArticleServices } from "./article.service.js";
import AppError from "../../errorsHelpers/AppError.js";
const createArticle = catchAsync(async (req, res, next) => {
    // req.body is fully formatted and validated by Zod
    const result = await ArticleServices.createArticle(req.body);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.CREATED,
        success: true,
        message: "Article created successfully!",
        data: result,
    });
});
const getAllArticles = catchAsync(async (req, res, next) => {
    const result = await ArticleServices.getAllArticles();
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Articles retrieved successfully",
        data: result,
    });
});
const updateArticle = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
        throw new AppError(httpStatus.StatusCodes.BAD_REQUEST, "A valid Article ID string is required in the URL parameter.");
    }
    const result = await ArticleServices.updateArticle(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Article updated successfully!",
        data: result,
    });
});
export const ArticleControllers = {
    createArticle,
    getAllArticles,
    updateArticle,
};
