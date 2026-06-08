import { z } from "zod";

const createOrderBodySchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  phone: z.string().min(11, "Valid phone number is required"),
  altPhone: z.string().optional(),

  // Allow empty strings to count as undefined/optional for emails
  email: z.email("Invalid email").optional().or(z.literal("")),

  address: z.string().min(5, "Detailed shipping address is required"),
  city: z.string().min(2, "City is required"),
  thana: z.string().min(2, "Thana/Area is required"),

  // Using your exact Prisma enum spelling
  paymentMethod: z.enum(["COD", "ONLINE"]).optional(),

  // Optional delivery fee if you want the frontend to charge 120 outside Dhaka
  deliveryFee: z.number().nonnegative().optional(),

  // Optional link to the User table if they are logged in
  userId: z.uuid().optional(),

  items: z
    .array(
      z.object({
        productId: z.string({ error: "Product ID is required" }),
        quantity: z.number().int().positive("Quantity must be at least 1"),
      }),
    )
    .min(1, "Order must contain at least one item"),
});

const createOrderZodSchema = z.object({
  body: createOrderBodySchema,
});

export const OrderValidation = {
  createOrderZodSchema,
};
