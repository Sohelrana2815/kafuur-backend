import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js"; // Leverages your core default validation layout [cite: 55]
import auth from "../../middlewares/auth.js"; // Matches your precise auth cookie interception middleware
import { Role } from "@prisma/client";
import { ProductControllers } from "./product.controller.js";
import { ProductValidation } from "./product.validation.js";
import { multerUpload } from "../../config/multer.config.js";
const router = Router();
/**
 * @route   POST /api/products
 * @desc    Allows authenticated administrators to register brand-new store catalog products
 * @access  Private (Role.ADMIN Only)
 */
router.post("/", auth(Role.ADMIN), // Strict validation: analyzes request tokens for Admin signature status permissions
multerUpload.array("files"), validateRequest(ProductValidation.createProducZodSchema), // Validates data layout fields via Zod before DB transactions
ProductControllers.createProduct);
export const ProductRoutes = router;
