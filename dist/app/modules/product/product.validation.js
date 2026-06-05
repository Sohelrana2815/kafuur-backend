import { z } from "zod";
const productBodySchema = z.object({
    name: z
        .string({
        error: "Product name is required",
    })
        .min(3, "Product name is too short!")
        .max(100, "Product name is too long"),
    slug: z
        .string({
        error: "Product slug is required"
    })
        .min(5, "Slug is too short!")
        .regex(/^[a-z0-9-]+$/, "Slug must be URL-safe (lowercase letters, numbers, and hyphens only)"),
    images: z
        .array(z.url({
        error: "Each image asset path must be a valid string path or URL",
    }))
        .nonempty({
        message: "At least one product image path is required",
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
        error: "Target fragrance classification category is required (MEN or WOMEN)",
    }),
});
const createProducZodSchema = z.object({
    body: productBodySchema,
});
// Future Proofing: Update schema where all properties are optional
const updateProducZodSchema = z.object({
    body: productBodySchema.partial()
});
export const ProductValidation = {
    createProducZodSchema,
    updateProducZodSchema,
};
