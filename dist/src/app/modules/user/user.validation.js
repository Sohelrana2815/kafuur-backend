import { z } from "zod";
// Update User Body Schema
const updateUserBodySchema = z.object({
    name: z
        .string()
        .min(3, "Full name is too short!")
        .max(30, "Full name is too long")
        .optional(),
    phone: z
        .string()
        .min(11, "Phone number must be at least 11 digits")
        .max(15, "Phone number is too long")
        .optional(),
    altPhone: z
        .string()
        .min(11, "Alternative phone number must be at least 11 digits")
        .max(15, "Alternative phone number is too long")
        .optional(),
    address: z
        .string()
        .min(3, "Address is too short")
        .max(255, "Address is too long")
        .optional(),
    city: z
        .string()
        .min(2, "City name is too short")
        .max(50, "City name is too long")
        .optional(),
    thana: z
        .string()
        .min(2, "Thana name is too short")
        .max(50, "Thana name is too long")
        .optional(),
});
// Update User Zod Schema
const updateUserZodSchema = z.object({
    body: updateUserBodySchema,
});
export const UpdateProfileValidation = {
    updateUserZodSchema,
};
