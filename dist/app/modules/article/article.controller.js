import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status-codes";
import { ArticleServices } from "./article.service.js";
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
export const ArticleControllers = {
    createArticle,
};
