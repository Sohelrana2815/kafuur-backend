import { z } from "zod";

const createProductBodySchema = z.object({
  name: z
    .string({
      error: "Product name is required",
    })
    .min(3, "Product name is too short!")
    .max(100, "Product name is too long"),

  // slug: z
  //   .string({
  //     error: "Product slug is required",
  //   })
  //   .min(5, "Slug is too short!")
  //   .regex(
  //     /^[a-z0-9-]+$/,
  //     "Slug must be URL-safe (lowercase letters, numbers, and hyphens only)",
  //   ),

  images: z
    .array(
      z.string({
        error: "Each image asset path must be a valid string path or URL",
      }),
    )
    .nonempty({
      message: "At least one product image is required",
    }),

  shortDescription: z
    .string({
      error: "Product Summary is required",
    })
    .min(10, "Product Summary is too short!")
    .max(255, "Product Summary is too long!"),

  longDescription: z
    .string({
      error: "Long is required",
    })
    .min(20, "Description must be at least 20 characters long."),

  price: z
    .number({
      error: "Product price is required",
    })
    .positive("Price must be a positive currency amount greater than 0"),

   category: z
  .enum(["MEN", "WOMEN"], {
    error: "Category must be either MEN or WOMEN",
  })
 
});

// Future Proofing: Update schema where all properties are optional
const updateProductBodySchema = z.object({
  name: z
    .string()
    .min(3, "Product name is too short!")
    .max(100, "Product name is too long")
    .optional(),

  slug: z
    .string()
    .min(5, "Slug is too short!")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be URL-safe (lowercase letters, numbers, and hyphens only)",
    )
    .optional(),

  shortDescription: z
    .string()
    .min(10, "Short description is too short!")
    .max(255, "Short description is too long!")
    .optional(),

  longDescription: z
    .string()
    .min(20, "Long description must provide substantial item specifications")
    .optional(),

  price: z
    .number()
    .positive("Price must be a positive currency amount greater than 0")
    .optional(),

  category: z
  .enum(["MEN", "WOMEN"], {
    error: "Category must be either MEN or WOMEN",
  })
  .optional(),

  // These handle your image adding/removing logic
  deleteImages: z.array(z.url({ message: "Must be a valid URL" })).optional(),

  newImages: z.array(z.url()).optional(),
});

export type TUpdateProductInput = z.infer<typeof updateProductBodySchema>;

// Add this below your updateProductZodSchema
const deleteProductsBodySchema = z.object({
  ids: z
    .array(z.string())
    .min(1, "At least one product ID is required for deletion."),
});

const createProductZodSchema = z.object({
  body: createProductBodySchema,
});

const updateProductZodSchema = z.object({
  body: updateProductBodySchema,
});

const deleteProductsZodSchema = z.object({
  body: deleteProductsBodySchema,
});

export const ProductValidation = {
  createProductZodSchema,
  updateProductZodSchema,
  deleteProductsZodSchema,
};
