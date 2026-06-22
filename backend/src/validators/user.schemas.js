import { z } from "zod";
import {
  THEMES,
  PROFILE_VISIBILITY,
  CURRENCIES,
  LANGUAGES,
  USER_ROLES,
} from "./enums.js";

export const updateProfileBodySchema = z.object({
  firstName: z.string().trim().max(50).optional().nullable(),
  lastName: z.string().trim().max(50).optional().nullable(),
  bio: z.string().trim().max(500).optional().nullable(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Must be a valid phone number")
    .optional()
    .nullable(),
});

export const updateSettingsBodySchema = z.object({
  language: z.enum(LANGUAGES).optional(),
  currency: z.enum(CURRENCIES).optional(),
  timezone: z.string().trim().max(80).optional(),
  theme: z.enum(THEMES).optional(),
  twoFactorEnabled: z.boolean().optional(),
  profileVisibility: z.enum(PROFILE_VISIBILITY).optional(),
});

const boolOptional = z.boolean().optional();

export const notificationPreferencesBodySchema = z.object({
  email: z
    .object({
      bookingRequests: boolOptional,
      bookingUpdates: boolOptional,
      newReviews: boolOptional,
      promotions: boolOptional,
      newsletter: boolOptional,
    })
    .optional(),
  push: z
    .object({
      bookingRequests: boolOptional,
      bookingUpdates: boolOptional,
      newReviews: boolOptional,
    })
    .optional(),
  sms: z
    .object({
      bookingRequests: boolOptional,
      bookingUpdates: boolOptional,
    })
    .optional(),
});

export const changeRoleBodySchema = z.object({
  role: z.enum(USER_ROLES, {
    required_error: "Role is required",
    message: `Role must be one of: ${USER_ROLES.join(", ")}`,
  }),
});
