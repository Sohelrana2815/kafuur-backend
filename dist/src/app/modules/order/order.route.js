import { Router } from "express";
// import validateRequest from "../../middlewares/validateRequest.js";
// import { OrderValidation } from "./order.validation.js";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { OrderControllers } from "./order.controller.js";
import { OrderValidation } from "./order.validation.js";
// import auth from "../../middlewares/auth.js"; // Import if protecting route
const router = Router();
router.post("/", auth(Role.CUSTOMER, Role.ADMIN), auth("CUSTOMER", "ADMIN"), // Uncomment to enforce login before buying
validateRequest(OrderValidation.createOrderZodSchema), OrderControllers.createOrder);
// Add this to your order.route.ts
router.get("/", auth(Role.ADMIN), OrderControllers.getAllOrders);
// GET /api/orders/my-orders
router.get("/my-orders", auth(Role.CUSTOMER, Role.ADMIN), OrderControllers.getMyOrders);
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), OrderControllers.getOrderById);
// Customer update route (Cancel or update delivery address before processing)
router.patch("/my-orders/:id", auth(Role.CUSTOMER, Role.ADMIN), validateRequest(OrderValidation.updateOrderCustomerZodSchema), OrderControllers.updateMyOrder);
// Admin update route (Status updates, payment status adjustments, logistics)
router.patch("/:id", auth(Role.ADMIN), validateRequest(OrderValidation.updateOrderAdminZodSchema), OrderControllers.updateOrderAdmin);
export const OrderRoutes = router;
