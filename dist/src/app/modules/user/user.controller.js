import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { UserServices } from "./user.service.js";
import httpStatus from "http-status-codes";
const createUser = catchAsync(async (req, res) => {
    const result = await UserServices.createUser(req.body);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.CREATED,
        success: true,
        message: "User Created Successfully",
        data: result,
    });
});
const getAllUsers = catchAsync(async (req, res) => {
    const result = await UserServices.getAllUsers(req.query);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "All Users retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
const getMyProfile = catchAsync(async (req, res) => {
    // Extract userId directly from the authenticated token payload
    const userId = req.user?.userId;
    const result = await UserServices.getMyProfile(userId);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Profile information retrieved successfully",
        data: result,
    });
});
// --- 1. CUSTOMER CONTROLLER ---
const updateMyProfile = catchAsync(async (req, res) => {
    // Extract userId directly from the authenticated token payload
    const userId = req.user?.userId;
    const payload = req.body;
    const result = await UserServices.updateMyProfile(userId, payload);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});
// --- 2. ADMIN CONTROLLER ---
const updateUserByAdmin = catchAsync(async (req, res) => {
    // Extract userId from the URL parameters
    const userId = req.params.id;
    const payload = req.body;
    const result = await UserServices.updateUserByAdmin(userId, payload);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "User updated successfully by Admin",
        data: result,
    });
});
const getUserById = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const result = await UserServices.getUserById(userId);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "User retrieved successfully",
        data: result,
    });
});
const deleteUserById = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const result = await UserServices.deleteUserById(userId);
    sendResponse(res, {
        statusCode: httpStatus.StatusCodes.OK,
        success: true,
        message: "User deleted successfully",
        data: result,
    });
});
export const UserControllers = {
    createUser,
    getAllUsers,
    getMyProfile,
    updateMyProfile,
    updateUserByAdmin,
    getUserById,
    deleteUserById
};
