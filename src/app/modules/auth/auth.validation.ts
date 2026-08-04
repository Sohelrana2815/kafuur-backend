import { z } from "zod";
// Create User Body Schema
const createUserBodySchema = z.object({
  name: z
    .string({ error: "Full name is required" })
    .min(3, "Full name is too short!")
    .max(30, "Full name is too long"),
  email: z.email("Invalid email format"),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});
// Login User Body Schema
const loginUserBodySchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string({ error: "Password is required" }),
});

// Change Password Body Schema
const changePasswordBodySchema = z
  .object({
    oldPassword: z.string({ error: "Old password is required" }),

    newPassword: z
      .string({ error: "New password is required" })
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from your old password",
  });



// Create User Zod Schema
const createUserZodSchema = z.object({
  body: createUserBodySchema,
});

// Login User Body Schema
const loginUserZodSchema = z.object({
  body: loginUserBodySchema,
});

// Change Password Zod Schema
const changePasswordZodSchema = z.object({
  body: changePasswordBodySchema,
});


export const CreateUserValidation = {
  createUserZodSchema,
  loginUserZodSchema,
  changePasswordZodSchema
};
