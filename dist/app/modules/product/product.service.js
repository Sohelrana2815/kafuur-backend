import prisma from "../../lib/prisma.js"; // Leverages your exact centralized Prisma file link [cite: 1]
import AppError from "../../errorsHelpers/AppError.js"; // Leverages your standard AppError handler [cite: 2]
import httpStatus from "http-status-codes";
/**
 * Persists a new fragrance item record within the PostgreSQL instance.
 * @param payload Fully typed data reflecting the Product schema specifications.
 */
const createProduct = async (payload) => {
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
export const ProductServices = {
    createProduct,
};
