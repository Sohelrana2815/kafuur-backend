import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth.js";
import { DashboardControllers } from "./dashboard.controller.js";

const router = Router();

// Admin Route
router.get("/admin", auth(Role.ADMIN), DashboardControllers.getAdminDashboard);

// Customer Route
router.get(
  "/customer",
  auth(Role.CUSTOMER),
  DashboardControllers.getCustomerDashboard,
);

export const DashboardRoutes = router;
