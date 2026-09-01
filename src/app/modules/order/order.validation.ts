import { OrderStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";

const createOrderBodySchema = z.object({
  cartItemIds: z.array(z.string()).min(1, "At least one cart item is required"),

  paymentMethod: z.enum(["COD", "ONLINE"]).optional(),
});

const updateOrderAdminBodySchema = z.object({
  status: z.enum(OrderStatus).optional(),
  paymentStatus: z.enum(PaymentStatus).optional(),
  transactionId: z.string().optional().nullable(),
  customerName: z.string().optional(),
  phone: z.string().optional(),
  altPhone: z.string().optional().nullable(),
  address: z.string().optional(),
  city: z.string().optional(),
  thana: z.string().optional(),
  deliveryFee: z.number().nonnegative().optional(),
  totalAmount: z.number().positive().optional(),
});

const updateOrderCustomerBodySchema = z.object({
  // Customers can only transition status to CANCELLED
  status: z.enum([OrderStatus.CANCELLED]).optional(),
  altPhone: z.string().optional().nullable(),
  address: z.string().optional(),
  city: z.string().optional(),
  thana: z.string().optional(),
});

const createOrderZodSchema = z.object({
  body: createOrderBodySchema,
});
const updateOrderAdminZodSchema = z.object({
  body: updateOrderAdminBodySchema,
});
const updateOrderCustomerZodSchema = z.object({
  body: updateOrderCustomerBodySchema,
});

export const OrderValidation = {
  createOrderZodSchema,
  updateOrderAdminZodSchema,
  updateOrderCustomerZodSchema,
};
