import { Router } from "express";
import auth from "../../middlewares/auth.js"; // Matches your precise auth cookie interception middleware
import { Role } from "@prisma/client";
import { UserControllers } from "./user.controller.js";

const router = Router();

router.get(
  "/",
  auth(Role.ADMIN),

  UserControllers.getAllUsers,
);

router.post("/register", UserControllers.createUser);

// PATCH routes (ORDER IS IMPORTANT)

// 1. Customer updates their own profile
// Both ADMIN and CUSTOMER can have a profile they want to update
router.patch(
  "/me",
  auth(Role.CUSTOMER, Role.ADMIN),
  UserControllers.updateMyProfile,
);

// 2. Admin updates another user's profile
// Only ADMIN is authorized to hit this parameter-based route
router.patch("/:id", auth(Role.ADMIN), UserControllers.updateUserByAdmin);

export const UserRoutes = router;

// /api/v1/users/register
