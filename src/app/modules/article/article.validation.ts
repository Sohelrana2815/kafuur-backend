import { z } from "zod";

const createArticleBodySchema = z.object({
  title: z
    .string({ error: "Article title is required" })
    .min(5, "Title must be at least 5 characters long")
    .max(150, "Title cannot exceed 150 characters"),

  metaDescription: z
    .string({ error: "Meta description is required for SEO" })
    .min(10, "Meta description is too short")
    .max(160, "Meta description should not exceed 160 characters"),

  slug: z
    .string({ error: "Article slug is required" })
    .min(5, "Slug is too short!")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be URL-safe (lowercase letters, numbers, and hyphens only)",
    ),

  content: z
    .string({ error: "Article text content is required" })
    .min(
      20,
      "Content body is too short! Please write a more detailed article.",
    ),

  category: z
    .string({ error: "Category is required" })
    .min(2, "Category name is too short"),

  tags: z
    .array(z.string())
    .nonempty({ message: "At least one tag is required for categorization" }),

  coverImage: z
    .url({ message: "Cover image must be a valid Cloudinary asset URL" })
    .optional(),

  published: z.boolean().optional().default(false),
});

// Future Proofing: Update schema where all properties are optional
const updateArticleBodySchema = z.object({
  title: z
    .string({ error: "Article title is required" })
    .min(5, "Title must be at least 5 characters long")
    .max(150, "Title cannot exceed 150 characters")
    .optional(),
  metaDescription: z
    .string({ error: "Meta description is required for SEO" })
    .min(10, "Meta description is too short")
    .max(160, "Meta description should not exceed 160 characters")
    .optional(),
  slug: z
    .string({ error: "Article slug is required" })
    .min(5, "Slug is too short!")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be URL-safe (lowercase letters, numbers, and hyphens only)",
    )
    .optional(),

  content: z
    .string({ error: "Article text content is required" })
    .min(20, "Content body is too short! Please write a more detailed article.")
    .optional(),

  category: z
    .string({ error: "Category is required" })
    .min(2, "Category name is too short")
    .optional(),
  tags: z
    .array(z.string())
    .nonempty({ message: "At least one tag is required for categorization" })
    .optional(),
  coverImage: z
    .url({ message: "Cover image must be a valid Cloudinary asset URL" })
    .optional(),
  // These handle your image adding/removing logic
  deleteImages: z
    .array(z.url({ message: "Must be a valid Cloudinary URL" }))
    .optional(),

  newImages: z.array(z.url()).optional(),
});

// Add this below your updateProducZodSchema
const deleteArticlesBodySchema = z.object({
  ids: z
    .array(z.string())
    .min(1, "At least one Article ID is required for deletion."),
});

const createArticleZodSchema = z.object({
  body: createArticleBodySchema,
});

const updateArticleZodSchema = z.object({
  body: updateArticleBodySchema,
});

const deleteArticlesZodSchema = z.object({
  body: deleteArticlesBodySchema,
});
export const ArticleValidation = {
  createArticleZodSchema,
  updateArticleZodSchema,
  deleteArticlesZodSchema,
};
