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
router.post("/", auth(Role.ADMIN), multerUpload.array("files"), 
// -> THE FIX: Bridge Middleware <-
(req, res, next) => {
    // 1. If text data is sent inside a 'data' string (common in Postman form-data), parse it early
    if (req.body?.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
    }
    // 2. Map Cloudinary file paths directly into the body so Zod can validate them
    if (req.files && Array.isArray(req.files)) {
        req.body.images = req.files.map((file) => file.path);
    }
    next();
}, validateRequest(ProductValidation.createProducZodSchema), ProductControllers.createProduct);
router.patch("/:id", auth(Role.ADMIN), multerUpload.array("files"), validateRequest(ProductValidation.updateProducZodSchema), ProductControllers.updateProduct);
export const ProductRoutes = router;
