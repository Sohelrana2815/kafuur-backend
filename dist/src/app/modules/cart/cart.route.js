import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import auth from "../../middlewares/auth.js";
import { Role } from "@prisma/client";
import { CartControllers } from "./cart.controller.js";
import { CartValidation } from "./cart.validation.js";
const router = Router();
// Retrieve cart data (requires login)
router.get("/", auth(Role.CUSTOMER, Role.ADMIN), CartControllers.getCart);
// router.get("/", auth(...Object(Role)), CartControllers.getCart);
// Get Order summary
router.get("/order-summary", auth(Role.CUSTOMER, Role.ADMIN), CartControllers.getOrderSummary);
// Add or update a single cart item
router.post("/", auth(Role.CUSTOMER, Role.ADMIN), validateRequest(CartValidation.addToCartZodSchema), CartControllers.addToCart);
router.patch("/increment", auth(Role.CUSTOMER, Role.ADMIN), validateRequest(CartValidation.incrementDecrementZodSchema), CartControllers.incrementCartItem);
router.patch("/decrement", auth(Role.CUSTOMER, Role.ADMIN), validateRequest(CartValidation.incrementDecrementZodSchema), CartControllers.decrementCartItem);
// router.patch(
//   "/",
//   auth(Role.CUSTOMER, Role.ADMIN),
//   validateRequest(CartValidation.updateCartItemZodSchema),
//   CartControllers.updateCartItem,
// );
// Merge local storage cart after successful login
// router.post(
//   "/sync",
//   auth(Role.CUSTOMER, Role.ADMIN),
//   validateRequest(CartValidation.syncCartZodSchema),
//   CartControllers.syncCart,
// );
// Single endpoint for both individual and bulk deletions
// router.delete(
//   "/",
//   auth(Role.CUSTOMER, Role.ADMIN),
//   CartControllers.deleteCartItems,
// );
// Add this below your existing routes
router.delete("/:id", auth(Role.CUSTOMER, Role.ADMIN), CartControllers.deleteSingleCartItem);
export const CartRoutes = router;
