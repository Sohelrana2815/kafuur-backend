import { Category, ScentProfile, ScentStrength, UsageOccasion, } from "@prisma/client";
import { z } from "zod";
const createProductBodySchema = z.object({
    name: z
        .string({
        error: "Product name is required",
    })
        .min(3, "Product name is too short!")
        .max(100, "Product name is too long"),
    images: z
        .array(z.string({
        error: "Each image asset path must be a valid string path or URL",
    }))
        .optional(),
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
    category: z.enum(["MEN", "WOMEN"], {
        error: "Category must be either MEN or WOMEN",
    }),
    // Required fragrance metadata
    usages: z
        .array(z.enum(UsageOccasion))
        .min(1, "At least one usage occasion is required"),
    scentProfiles: z
        .array(z.enum(ScentProfile))
        .min(1, "At least one scent profile is required"),
    strength: z.enum(ScentStrength, {
        error: "Scent strength is required",
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
        .regex(/^[a-z0-9-]+$/, "Slug must be URL-safe (lowercase letters, numbers, and hyphens only)")
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
    // Cloudinary URL strings are valid URLs, so z.url() is the correct strict check here
    newImages: z.array(z.url()).optional(),
    // Optional on update to support partial updates
    scentProfiles: z.array(z.enum(ScentProfile)).optional(),
    usages: z.array(z.enum(UsageOccasion)).optional(),
    strength: z.enum(ScentStrength).optional(),
});
const getRecommendationsBodySchema = z
    .object({
    usages: z
        .array(z.enum(UsageOccasion, {
        error: "Provide scent usages. e.g, Office, Outdoor etc.",
    }))
        .min(1, "Select at least one usage occasion"),
    scentProfiles: z
        .array(z.enum(ScentProfile, {
        error: "Provide scent profiles e.g, Fresh, Sweet or else.",
    }))
        .min(1, "Select at least one scent profile"),
    strength: z.enum(ScentStrength, {
        error: "Scent strength is required",
    }),
    category: z.enum(Category).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
})
    .refine((data) => data.minPrice === undefined ||
    data.maxPrice === undefined ||
    data.maxPrice === 0 ||
    data.maxPrice >= data.minPrice, {
    message: "Maximum price must be greater than or equal to minimum price",
    path: ["maxPrice"],
});
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
const getRecommendationsZodSchema = z.object({
    body: getRecommendationsBodySchema,
});
export const ProductValidation = {
    createProductZodSchema,
    updateProductZodSchema,
    deleteProductsZodSchema,
    getRecommendationsZodSchema,
};
