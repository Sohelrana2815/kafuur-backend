/* eslint-disable @typescript-eslint/no-unused-vars */
import { Product } from "@prisma/client";
import prisma from "../../lib/prisma.js"; // Leverages your exact centralized Prisma file link [cite: 1]
import AppError from "../../errorsHelpers/AppError.js"; // Leverages your standard AppError handler [cite: 2]
import httpStatus from "http-status-codes";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config.js";
import { TUpdateProductInput } from "./product.validation.js";
import { productSearchableFields } from "./product.constant.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";

const createProduct = async (payload: Product): Promise<Product> => {
  // throw new Error("A Product with this slug already exists.");
  // Check for slug conflicts to enforce the @unique database schema constraint
  const existingProduct = await prisma.product.findUnique({
    where: { slug: payload.slug },
  });

  if (existingProduct) {
    throw new AppError(
      httpStatus.StatusCodes.CONFLICT,
      "A product with this URL slug already exists. Slug must be completely unique.",
    );
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
const getAllProducts = async (query: Record<string, any>) => {
  // Pass baseline constraints directly (e.g., filter out deleted products automatically)
  const queryBuilder = new QueryBuilder(prisma.product, {
    isDeleted: false,
    ...query,
  });

  const productsQuery = queryBuilder
    .search(productSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  // Concurrently fetch catalog payload data and total counter metadata
  const [data, meta] = await Promise.all([
    productsQuery.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

export const updateProduct = async (
  id: string,
  payload: TUpdateProductInput,
) => {
  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) throw new AppError(404, "Product not found");

  const { deleteImages, newImages, ...updateData } = payload;

  let updatedImages: string[] = [...(existingProduct.images || [])];

  // Copy old images like [img1,img2]

  if (deleteImages && Array.isArray(deleteImages)) {
    for (const url of deleteImages) {
      await deleteImageFromCloudinary(url);
    }
    // Filter out deleted items safely
    updatedImages = updatedImages.filter((img) => !deleteImages.includes(img));
  }

  // 3. Process new asset additions
  if (newImages && newImages.length > 0) {
    updatedImages = [...updatedImages, ...newImages];
  }

  // 4. Update DB with total compile-time safety
  return await prisma.product.update({
    where: { id },
    data: {
      ...updateData, // Contains only name, slug, price, shortDescription, longDescription, category
      images: updatedImages, // Explicitly binds the cleanly modified image array
    },
  });
};

const getProductById = async (id: string) => {
  const result = await prisma.product.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!result) {
    throw new AppError(
      httpStatus.StatusCodes.NOT_FOUND,
      "The requested product could not be found or has been removed.",
    );
  }
  return result;
};

const deleteProducts = async (ids: string[]) => {
  // 1. Fetch targeted items that haven't been soft deleted yet
  const productsToDelete = await prisma.product.findMany({
    where: {
      id: { in: ids },
      isDeleted: false,
    },
  });

  if (productsToDelete.length === 0) {
    throw new AppError(
      httpStatus.StatusCodes.NOT_FOUND,
      "No matching active products were found to delete.",
    );
  }

  // 2. Gather every single image path across the list of items
  const allImageUrls = productsToDelete.flatMap((product) => product.images);

  // 3. Fire parallel hard-delete executions directly into Cloudinary
  if (allImageUrls.length > 0) {
    await Promise.all(
      allImageUrls.map((url) => deleteImageFromCloudinary(url)),
    );
  }

  // 4. Conclude the transaction by soft-deleting targets and cleaning out URLs
  const result = await prisma.product.updateMany({
    where: {
      id: { in: ids },
    },
    data: {
      isDeleted: true,
      images: [], // Clears broken URLs so your database remains clean
    },
  });

  return result;
};

export const ProductServices = {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProducts,
  getProductById,
};
