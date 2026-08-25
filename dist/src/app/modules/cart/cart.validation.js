import { z } from "zod";
const addToCartBodySchema = z.object({
    productId: z.string({ error: "Product ID is required" }),
    // Allowing 0 here so the backend knows to delete the item
    // quantity: z.number().int().min(1, "Quantity must be at least One"),
});
const incrementDecrementBodySchema = z.object({
    productId: z.string({
        error: "Product ID is required for increment and decrement the quantity",
    }),
});
// const updateCartBodySchema = z.object({
//     productId: z.string({ error: "Product ID is required" }),
//     // Allowing 0 here so the backend knows to delete the item
//     quantity: z.number().int().min(1, "Quantity must be at least One"),
// });
const addToCartZodSchema = z.object({
    body: addToCartBodySchema,
});
const incrementDecrementZodSchema = z.object({
    body: incrementDecrementBodySchema,
});
// const updateCartItemZodSchema = z.object({
//     body: updateCartBodySchema,
// });
// const syncCartZodSchema = z.object({
//     body: z.object({
//         items: z.array(cartItemBodySchema).min(1, "Cart cannot be empty for syncing"),
//     }),
// });
export const CartValidation = {
    addToCartZodSchema,
    // updateCartItemZodSchema,
    incrementDecrementZodSchema,
    // syncCartZodSchema,
};
