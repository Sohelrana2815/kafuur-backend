import prisma from "../../lib/prisma.js"; // Leverages your exact centralized Prisma file link [cite: 1]
import AppError from "../../errorsHelpers/AppError.js"; // Leverages your standard AppError handler [cite: 2]
import httpStatus from "http-status-codes";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config.js";
/**
 * Persists a new fragrance item record within the PostgreSQL instance.
 * @param payload Fully typed data reflecting the Product schema specifications.
 */
const createProduct = async (payload) => {
    // throw new Error("A Product with this slug already exists.");
    // Check for slug conflicts to enforce the @unique database schema constraint
    const existingProduct = await prisma.product.findUnique({
        where: { slug: payload.slug },
    });
    if (existingProduct) {
        throw new AppError(httpStatus.StatusCodes.CONFLICT, "A product with this URL slug already exists. Slugs must be completely unique.");
    }
    // Write new entity data directly into the database engine
    const result = await prisma.product.create({
        data: {
            name: payload.name,
            slug: payload.slug,
            images: payload.images, // Array mapping for multiple asset path entries
            shortDescription: payload.shortDescription,
            longDescription: payload.longDescription,
            price: payload.price, // Prisma automatically maps this float/string safely down to db.Decimal(10,2)
            category: payload.category, // Strictly validated matching MEN | WOMEN enums
        },
    });
    return result;
};
/**
 * Updates an existing product in the database.
 * @param id The unique identifier of the product.
 * @param payload Partial product data to update.
 */
const updateProduct = async (id, payload) => {
    // 1. Verify the product exists first
    const existingProduct = await prisma.product.findUnique({
        where: { id },
    });
    if (!existingProduct) {
        throw new AppError(httpStatus.StatusCodes.NOT_FOUND, "Product not found");
    }
    // 2. If the admin is changing the slug, ensure it doesn't collide with another product
    if (payload.slug && payload.slug !== existingProduct.slug) {
        const slugExists = await prisma.product.findUnique({
            where: { slug: payload.slug },
        });
        if (slugExists) {
            throw new AppError(httpStatus.StatusCodes.CONFLICT, "This slug is already used by another product. Slugs must be unique.");
        }
    }
    if (payload.images &&
        payload.images.length > 0 &&
        existingProduct.images &&
        existingProduct.images.length > 0) {
        payload.images = [...payload.images, ...existingProduct.images];
    }
    if (payload.deleteImages &&
        payload.deleteImages.length > 0 &&
        existingProduct.images &&
        existingProduct.images.length > 0) {
        const restDBImages = existingProduct.images.filter((imageUrl) => !payload.deleteImages?.includes(imageUrl));
        const updatedPayloadImages = (payload.images || [])
            .filter((imageUrl) => !payload.deleteImages?.includes(imageUrl))
            .filter((imageUrl) => !restDBImages.includes(imageUrl));
        payload.images = [...restDBImages, ...updatedPayloadImages];
    }
    // 3. Perform the update
    const result = await prisma.product.update({
        where: { id },
        data: payload,
    });
    if (payload.deleteImages &&
        payload.deleteImages.length > 0 &&
        existingProduct.images &&
        existingProduct.images.length > 0) {
        await Promise.all(payload.deleteImages.map((url) => deleteImageFromCloudinary(url)));
    }
    return result;
};
// Don't forget to export it!
export const ProductServices = {
    createProduct,
    updateProduct, // <-- Add this
};
