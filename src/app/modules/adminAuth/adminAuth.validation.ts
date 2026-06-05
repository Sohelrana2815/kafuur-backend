import { z } from "zod";

const registerAdminBodySchema = z.object({
    username: z
        .string({ error: "Username is required" })
        .min(3, "Username is too short!")
        .max(30, "Username is too long"),
    email: z
        .email("Invalid email format"),
    password: z
        .string({ error: "Password is required" })
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain a number"),
});


const loginAdminBodySchema = z.object({
    email: z
        .email("Invalid email format"),
    password: z
        .string({ error: "Password is required" }),
})

const registerAdminZodSchema = z.object({
    body: registerAdminBodySchema,
})
const loginAdminZodSchema = z.object({
    body: loginAdminBodySchema,
})





export const AdminAuthValidation = {
    registerAdminZodSchema,
    loginAdminZodSchema,
};