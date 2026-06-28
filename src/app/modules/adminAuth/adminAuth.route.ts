import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js"; // Leverages your validation middleware [cite: 127]
import auth from "../../middlewares/auth.js"; // Leverages your exact auth.ts middleware file
import { AdminAuthControllers } from "./adminAuth.controller.js";
import { AdminAuthValidation } from "./adminAuth.validation.js";
import { Role } from "@prisma/client";
const router = Router();

/**
 * Secure Endpoint: Only an existing logged-in Admin can create or register another Admin
 */
router.post(
  "/register",
  auth(Role.ADMIN), // Uses your exact auth(...) role validation signature logic
  validateRequest(AdminAuthValidation.registerAdminZodSchema),
  AdminAuthControllers.registerAdmin,
);

/**
 * Public Endpoint: Gateway used by admins to gain session credentials and enter dashboard
 */
router.post(
  "/login",
  validateRequest(AdminAuthValidation.loginAdminZodSchema),
  AdminAuthControllers.loginAdmin,
);

export const AdminAuthRoutes = router;
