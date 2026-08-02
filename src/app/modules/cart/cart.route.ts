import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import auth from "../../middlewares/auth.js";
import { Role } from "@prisma/client";
import { CartControllers } from "./cart.controller.js";
import { CartValidation } from "./cart.validation.js";

const router = Router();

// Get Order summary
router.get("/order-summary", auth(Role.CUSTOMER, Role.ADMIN), CartControllers.getOrderSummary);

// Retrieve cart data (requires login)
router.get("/", auth(Role.CUSTOMER,Role.ADMIN), CartControllers.getCart);
// router.get("/", auth(...Object(Role)), CartControllers.getCart);

// Add or update a single cart item
router.post(
  "/",
  auth(Role.CUSTOMER, Role.ADMIN),
  validateRequest(CartValidation.updateCartItemZodSchema),
  CartControllers.updateCartItem,
);

// Merge local storage cart after successful login
router.post(
  "/sync",
  auth(Role.CUSTOMER, Role.ADMIN),
  validateRequest(CartValidation.syncCartZodSchema),
  CartControllers.syncCart,
);

export const CartRoutes = router;
