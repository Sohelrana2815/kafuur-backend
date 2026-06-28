import { NextFunction, Request, Response, Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js"; // Leverages your core default validation layout [cite: 55]
import auth from "../../middlewares/auth.js"; // Matches your precise auth cookie interception middleware
import { Role } from "@prisma/client";
import { ProductControllers } from "./product.controller.js";
import { ProductValidation } from "./product.validation.js";
import { multerUpload } from "../../config/multer.config.js";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN),
  multerUpload.array("files"),
  // -> THE FIX: Bridge Middleware <-
  (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body?.data);
    // console.log("Does req.body.images exist yet?:", "images" in req.body);
    // 1. If text data is sent inside a 'data' string (common in Postman form-data), parse it early
    if (req.body?.data && typeof req.body.data === "string") {
      req.body = JSON.parse(req.body.data);
    }
    // console.log(typeof req.body);
    // console.log(typeof req.body);
    // console.log("Does req.body.images exist yet?:", "images" in req.body);

    // 2. Map Cloudinary file paths directly into the body so Zod can validate them
    if (req.files && Array.isArray(req.files)) {
      req.body.images = (req.files as Express.Multer.File[]).map(
        (file) => file.path,
      );
    } else {
      req.body.images = [];
    }

    next();
  },
  validateRequest(ProductValidation.createProducZodSchema),
  ProductControllers.createProduct,
);

router.get("/", ProductControllers.getAllProducts);

router.patch(
  "/bulk-delete",
  auth(Role.ADMIN),
  validateRequest(ProductValidation.deleteProductsZodSchema),
  ProductControllers.deleteProducts,
);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  multerUpload.array("files"),
  // ---> THE BRIDGE MIDDLEWARE <---
  (req: Request, res: Response, next: NextFunction) => {
    // 1. Parse the text data from Postman so 'deleteImages' becomes a real array
    if (req.body?.data && typeof req.body.data === "string") {
      req.body = JSON.parse(req.body.data);
    }

    // 2. Map the newly uploaded Cloudinary URLs into a 'newImages' array
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.body.newImages = (req.files as Express.Multer.File[]).map(
        (file) => file.path,
      );
    } else {
      req.body.newImages = []; // Explicitly set empty if no new files
    }

    next();
  },
  validateRequest(ProductValidation.updateProducZodSchema),
  ProductControllers.updateProduct,
);
router.get("/:slug", ProductControllers.getSingleProduct);
router.get("/:id", ProductControllers.getProductById);
export const ProductRoutes = router;
