import { z } from "zod";

const cartItemBodySchema = z.object({
    productId: z.string({ error: "Product ID is required" }),
    // Allowing 0 here so the backend knows to delete the item
    quantity: z.number().int().min(0, "Quantity cannot be negative"),
});

const updateCartItemZodSchema = z.object({
    body: cartItemBodySchema,
});

const syncCartZodSchema = z.object({
    body: z.object({
        items: z.array(cartItemBodySchema).min(1, "Cart cannot be empty for syncing"),
    }),
});

export const CartValidation = {
    updateCartItemZodSchema,
    syncCartZodSchema,
};


