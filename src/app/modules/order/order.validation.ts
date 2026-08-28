import { z } from "zod";

const createOrderBodySchema = z.object({
  cartItemIds: z.array(z.string()).min(1, "At least one cart item is required"),

  paymentMethod: z.enum(["COD", "ONLINE"]).optional(),
});
const createOrderZodSchema = z.object({
  body: createOrderBodySchema,
});

export const OrderValidation = {
  createOrderZodSchema,
};
