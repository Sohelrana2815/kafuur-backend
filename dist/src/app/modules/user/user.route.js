import { Router } from "express";
import auth from "../../middlewares/auth.js"; // Matches your precise auth cookie interception middleware
import { Role } from "@prisma/client";
import { UserControllers } from "./user.controller.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { CreateUserValidation } from "../auth/auth.validation.js";
import { UpdateProfileValidation } from "./user.validation.js";
const router = Router();
router.get("/", auth(Role.ADMIN), UserControllers.getAllUsers);
router.post("/register", validateRequest(CreateUserValidation.createUserZodSchema), UserControllers.createUser);
// Add this near your other routes in UserRoutes
router.get("/me", auth(Role.CUSTOMER, Role.ADMIN), // Both roles can view their own profile
UserControllers.getMyProfile);
// Admin fetches a single user by ID (MUST be below /me)
router.get("/:id", auth(Role.ADMIN), UserControllers.getUserById);
// PATCH routes (ORDER IS IMPORTANT)
// 1. Customer updates their own profile
// Both ADMIN and CUSTOMER can have a profile they want to update
router.patch("/me", auth(Role.CUSTOMER, Role.ADMIN), validateRequest(UpdateProfileValidation.updateUserZodSchema), UserControllers.updateMyProfile);
// 2. Admin updates another user's profile
// Only ADMIN is authorized to hit this parameter-based route
router.patch("/:id", auth(Role.ADMIN), UserControllers.updateUserByAdmin);
router.delete("/:id", auth(Role.ADMIN), UserControllers.deleteUserById);
export const UserRoutes = router;
// /api/v1/users/register
