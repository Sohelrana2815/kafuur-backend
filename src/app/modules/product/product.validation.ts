import { z } from "zod";

const createProductBodySchema = z.object({
  name: z
    .string({
      error: "Product name is required",
    })
    .min(3, "Product name is too short!")
    .max(100, "Product name is too long"),

  slug: z
    .string({
      error: "Product slug is required",
    })
    .min(5, "Slug is too short!")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be URL-safe (lowercase letters, numbers, and hyphens only)",
    ),

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
      error: "Short description is required",
    })
    .min(10, "Short description is too short!")
    .max(255, "Short description is too long!"),

  longDescription: z
    .string({
      error: "Long description text block is required",
    })
    .min(20, "Long description must provide substantial item specifications"),

  price: z
    .number({
      error: "Product price is required",
    })
    .positive("Price must be a positive currency amount greater than 0"),

  category: z.enum(["MEN", "WOMEN"], {
    error:
      "Target fragrance classification category is required (MEN or WOMEN)",
  }),
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

  category: z.enum(["MEN", "WOMEN"]).optional(),

  // These handle your image adding/removing logic
  deleteImages: z.array(z.url({ message: "Must be a valid URL" })).optional(),

  newImages: z.array(z.url()).optional(),
});

export type TUpdateProductInput = z.infer<typeof updateProductBodySchema>;

// Add this below your updateProducZodSchema
const deleteProductsBodySchema = z.object({
  ids: z
    .array(z.string())
    .min(1, "At least one product ID is required for deletion."),
});

const createProducZodSchema = z.object({
  body: createProductBodySchema,
});

const updateProducZodSchema = z.object({
  body: updateProductBodySchema,
});

const deleteProductsZodSchema = z.object({
  body: deleteProductsBodySchema,
});

export const ProductValidation = {
  createProducZodSchema,
  updateProducZodSchema,
  deleteProductsZodSchema,
};
