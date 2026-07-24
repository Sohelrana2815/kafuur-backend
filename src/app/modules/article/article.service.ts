import { Article } from "@prisma/client";
import httpStatus from "http-status-codes";
import prisma from "../../lib/prisma.js";
import AppError from "../../errorsHelpers/AppError.js";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config.js";

/**
 * Persists a new blog article record into the PostgreSQL database.
 * @param payload Fully validated data reflecting the Article schema specifications.
 */
const createArticle = async (payload: Article): Promise<Article> => {
  // 1. Enforce uniqueness on the slug to prevent broken routing links
  const existingArticle = await prisma.article.findUnique({
    where: { slug: payload.slug },
  });

  if (existingArticle) {
    throw new AppError(
      httpStatus.StatusCodes.CONFLICT,
      "An article with this URL slug already exists. Slugs must be completely unique.",
    );
  }

  // 2. Save the new article entity record
  const result = await prisma.article.create({
    data: {
      title: payload.title,
      metaDescription: payload.metaDescription,
      slug: payload.slug,
      content: payload.content,
      category: payload.category,
      tags: payload.tags,
      coverImage: payload.coverImage || null,
      published: payload.published ?? false,
    },
  });

  return result;
};

const getAllArticles = async () => {
  // Only get products that haven't been soft-deleted
  return await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });
};
/**
 * Updates an existing article, handling single cover image replacements or deletions.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateArticle = async (id: string, payload: any) => {
  // 1. Fetch the existing article to check its current image
  const existingArticle = await prisma.article.findUnique({ where: { id } });
  if (!existingArticle) {
    throw new AppError(httpStatus.StatusCodes.NOT_FOUND, "Article not found");
  }

  let finalCoverImage = existingArticle.coverImage;

  // 2. Scenario A: Admin uploaded a NEW image (Replacement)
  // Our bridge middleware will map the new file to payload.coverImage
  if (payload.coverImage) {
    // If there was an old image, delete it from Cloudinary first
    if (existingArticle.coverImage) {
      await deleteImageFromCloudinary(existingArticle.coverImage);
    }
    finalCoverImage = payload.coverImage; // Set the new image
  }

  // 3. Scenario B: Admin wants to DELETE the current image without adding a new one
  // We check if the existing coverImage URL is inside the deleteImages array
  else if (
    payload.deleteImages &&
    Array.isArray(payload.deleteImages) &&
    existingArticle.coverImage &&
    payload.deleteImages.includes(existingArticle.coverImage)
  ) {
    await deleteImageFromCloudinary(existingArticle.coverImage);
    finalCoverImage = null; // Wipe it from the database
  }

  // 4. Strip out the temporary array fields before updating Prisma
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { deleteImages, newImages, ...updateData } = payload;

  // 5. Save the updated record
  const result = await prisma.article.update({
    where: { id },
    data: {
      ...updateData,
      coverImage: finalCoverImage,
    },
  });

  return result;
};







export const ArticleServices = {
  createArticle,
  updateArticle,
  getAllArticles,
};
