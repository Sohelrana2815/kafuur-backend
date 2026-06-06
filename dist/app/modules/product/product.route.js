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
router.post("/", auth(Role.ADMIN), multerUpload.array("files"), validateRequest(ProductValidation.createProducZodSchema), ProductControllers.createProduct);
router.patch("/:id", auth(Role.ADMIN), multerUpload.array("files"), validateRequest(ProductValidation.createProducZodSchema), ProductControllers.updateProduct);
export const ProductRoutes = router;
