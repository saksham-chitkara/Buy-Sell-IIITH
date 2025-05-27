import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .endsWith(".iiit.ac.in", "Only IIIT email addresses are allowed"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z
      .string()
      .email("Invalid email address")
      .endsWith(".iiit.ac.in", "Only IIIT email addresses are allowed"),
    age: z
      .number()
      .min(16, "You must be at least 16 years old")
      .max(200, "Invalid age"),
    contactNumber: z.string().regex(/^\d{10}$/, "Invalid contact number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
