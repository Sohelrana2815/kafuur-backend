import { Router } from "express";
// import validateRequest from "../../middlewares/validateRequest.js";
// import { OrderValidation } from "./order.validation.js";
import { OrderControllers } from "./order.controller.js";
import auth from "../../middlewares/auth.js";
import { Role } from "@prisma/client";
// import auth from "../../middlewares/auth.js"; // Import if protecting route

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Creates a new customer order and linked order items
 * @access  Public (Guest Checkout) or Private
 */
router.post(
  "/",
  auth(Role.CUSTOMER, Role.ADMIN),
  // auth("CUSTOMER", "ADMIN"), // Uncomment to enforce login before buying
  // validateRequest(OrderValidation.createOrderZodSchema),
  OrderControllers.createOrder,
);

// Add this to your order.route.ts
router.get("/", auth(Role.ADMIN), OrderControllers.getAllOrders);
export const OrderRoutes = router;

// GET /api/orders/my-orders
router.get("/my-orders", auth(Role.CUSTOMER, Role.ADMIN), OrderControllers.getMyOrders);
