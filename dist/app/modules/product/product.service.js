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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateProduct = async (id, payload) => {
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct)
        throw new AppError(404, "Product not found");
    // 1. Process deletions
    if (payload.deleteImages && Array.isArray(payload.deleteImages)) {
        for (const url of payload.deleteImages) {
            await deleteImageFromCloudinary(url); // Real-time deletion
        }
        // Remove deleted images from the final array
        payload.images = (existingProduct.images || []).filter((img) => !payload.deleteImages.includes(img));
    }
    else {
        // If no deletions, start with current
        payload.images = [...(existingProduct.images || [])];
    }
    // 2. Add new images (if any were uploaded)
    if (payload.newImages && payload.newImages.length > 0) {
        payload.images = [...payload.images, ...payload.newImages];
    }
    // 3. Update DB
    const { deleteImages, newImages, ...updateData } = payload;
    return await prisma.product.update({
        where: { id },
        data: { ...updateData, images: payload.images },
    });
};
// const updateProduct = async (id: string, payload: Partial<Product>) => {
//   // 1. Fetch the current product
//   const existingProduct = await prisma.product.findUnique({ where: { id } });
//   if (!existingProduct) throw new AppError(404, "Product not found");
//   let updatedImages = [...(existingProduct.images || [])];
//   // 2. Handle Deletions: Delete from Cloudinary and remove from the array
//   if (payload.deleteImages && payload.deleteImages.length > 0) {
//     for (const url of payload.deleteImages) {
//       await deleteImageFromCloudinary(url);
//       updatedImages = updatedImages.filter((img) => img !== url);
//     }
//   }
//   // 3. Handle Additions: Append new images (from your middleware)
//   if (payload.images && payload.images.length > 0) {
//     updatedImages = [...updatedImages, ...payload.images];
//   }
//   // 4. Update Database
//   // Note: Ensure you don't send 'deleteImages' field to prisma if it's not in your model
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const { deleteImages, ...dataToUpdate } = payload;
//   return await prisma.product.update({
//     where: { id },
//     data: {
//       ...dataToUpdate,
//       images: updatedImages,
//     },
//   });
// };
/**
 * Updates an existing product in the database.
 * @param id The unique identifier of the product.
 * @param payload Partial product data to update.
 */
// const updateProduct = async (
//   id: string,
//   payload: Partial<Product>,
// ): Promise<Product> => {
//   // 1. Verify the product exists first
//   const existingProduct = await prisma.product.findUnique({
//     where: { id },
//   });
//   if (!existingProduct) {
//     throw new AppError(httpStatus.StatusCodes.NOT_FOUND, "Product not found");
//   }
//   // 2. If the admin is changing the slug, ensure it doesn't collide with another product
//   if (payload.slug && payload.slug !== existingProduct.slug) {
//     const slugExists = await prisma.product.findUnique({
//       where: { slug: payload.slug },
//     });
//     if (slugExists) {
//       throw new AppError(
//         httpStatus.StatusCodes.CONFLICT,
//         "This slug is already used by another product. Slugs must be unique.",
//       );
//     }
//   }
//   if (
//     payload.images &&
//     payload.images.length > 0 &&
//     existingProduct.images &&
//     existingProduct.images.length > 0
//   ) {
//     payload.images = [...payload.images, ...existingProduct.images];
//   }
//   if (
//     payload.deleteImages &&
//     payload.deleteImages.length > 0 &&
//     existingProduct.images &&
//     existingProduct.images.length > 0
//   ) {
//     const restDBImages = existingProduct.images.filter(
//       (imageUrl) => !payload.deleteImages?.includes(imageUrl),
//     );
//     const updatedPayloadImages = (payload.images || [])
//       .filter((imageUrl) => !payload.deleteImages?.includes(imageUrl))
//       .filter((imageUrl) => !restDBImages.includes(imageUrl));
//     payload.images = [...restDBImages, ...updatedPayloadImages];
//   }
//   // 3. Perform the update
//   const result = await prisma.product.update({
//     where: { id },
//     data: payload,
//   });
//   if (
//     payload.deleteImages &&
//     payload.deleteImages.length > 0 &&
//     existingProduct.images &&
//     existingProduct.images.length > 0
//   ) {
//     await Promise.all(
//       payload.deleteImages.map((url) => deleteImageFromCloudinary(url)),
//     );
//   }
//   return result;
// };
// Don't forget to export it!
export const ProductServices = {
    createProduct,
    updateProduct, // <-- Add this
};
