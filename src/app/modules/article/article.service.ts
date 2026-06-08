import { Article } from "@prisma/client";
import httpStatus from "http-status-codes";
import prisma from "../../lib/prisma.js";
import AppError from "../../errorsHelpers/AppError.js";

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

export const ArticleServices = {
  createArticle,
};
