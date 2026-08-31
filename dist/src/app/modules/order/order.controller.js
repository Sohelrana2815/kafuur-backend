import httpStatus from "http-status-codes";
import AppError from "../../errorsHelpers/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { OrderServices } from "./order.service.js";
const createOrder = catchAsync(async (req, res) => {
    // Utilizing your clean global Express interface
    const userId = req.user?.userId;
    console.log(userId, req.body, "From controller");
    if (!userId) {
        throw new AppError(httpStatus.StatusCodes.UNAUTHORIZED, "You are not authorized");
    }
    const result = await OrderServices.createOrder(userId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.CREATED,
        success: true,
        message: result.paymentUrl
            ? "Order pending. Redirecting to payment gateway..."
            : "Order placed successfully!",
        data: result,
    });
});
const getAllOrders = catchAsync(async (req, res) => {
    const result = await OrderServices.getAllOrders(req.query);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Orders retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
// Get my orders
const getMyOrders = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    const result = await OrderServices.getMyOrders(userId);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Orders retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const getOrderById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const result = await OrderServices.getOrderById(id, user);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Order details retrieved successfully.",
        data: result,
    });
});
export const OrderControllers = {
    createOrder,
    getAllOrders,
    getMyOrders,
    getOrderById,
};
