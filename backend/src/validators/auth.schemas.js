import { z } from "zod";
import { nonEmptyString } from "./primitives.js";

export const signupBodySchema = z.object({
  username: nonEmptyString("Username").max(30, "Username too long"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
});

export const loginBodySchema = z.object({
  username: nonEmptyString("Username"),
  password: nonEmptyString("Password"),
});

export const forgotPasswordBodySchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Must be a valid email address")
    .toLowerCase(),
});

export const resetPasswordBodySchema = z
  .object({
    token: z
      .string({ required_error: "Reset token is required" })
      .trim()
      .min(1, "Reset token cannot be empty"),
    password: z
      .string({ required_error: "New password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password cannot exceed 128 characters"),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.confirmPassword !== undefined &&
      data.confirmPassword !== data.password
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const verifyEmailBodySchema = z.object({
  token: z
    .string({ required_error: "Verification token is required" })
    .trim()
    .min(1, "Verification token cannot be empty"),
});
