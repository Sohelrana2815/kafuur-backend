import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import auth from "../../middlewares/auth.js";
import { Role } from "@prisma/client";
import { ArticleControllers } from "./article.controller.js";
import { ArticleValidation } from "./article.validation.js";
import { multerUpload } from "../../config/multer.config.js";
const router = Router();
/**
 * @route   POST /api/articles
 * @desc    Allows authenticated administrators to create a blog article with an optional cover image
 * @access  Private (Role.ADMIN Only)
 */
router.post("/", auth(Role.ADMIN), multerUpload.single("file"), // Expects a single image parameter named "file" from form-data
(req, res, next) => {
    // 1. Parse text data if sent inside a stringified 'data' field (Postman layout)
    if (req.body?.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
    }
    // 2. Map the single uploaded Cloudinary file path directly into the body for Zod
    if (req.file) {
        req.body.coverImage = req.file.path;
    }
    next();
}, validateRequest(ArticleValidation.createArticleZodSchema), ArticleControllers.createArticle);
router.get("/", auth(Role.ADMIN), ArticleControllers.getAllArticles);
/**
 * @route   PATCH /api/articles/:id
 * @desc    Updates a blog article, handling text edits and single image replacement/deletion
 * @access  Private (Role.ADMIN Only)
 */
router.patch("/:id", auth(Role.ADMIN), multerUpload.single("file"), // Look for a single file input
// Bridge Middleware
(req, res, next) => {
    // 1. Parse text data from Postman's stringified JSON
    if (req.body?.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
    }
    // 2. If a new file was uploaded, map it to coverImage for validation & service logic
    if (req.file) {
        req.body.coverImage = req.file.path;
    }
    next();
}, validateRequest(ArticleValidation.updateArticleZodSchema), ArticleControllers.updateArticle);
export const ArticleRoutes = router;
