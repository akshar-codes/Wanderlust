import { z } from "zod";
import { nonEmptyString } from "./primitives.js";

export const createCollectionBodySchema = z.object({
  name: nonEmptyString("Name").max(60, "Name cannot exceed 60 characters"),
  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters")
    .optional()
    .nullable(),
});

export const updateCollectionBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name cannot be empty")
    .max(60, "Name cannot exceed 60 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters")
    .optional()
    .nullable(),
});

export const toggleWishlistBodySchema = z.object({
  collectionId: z.string().trim().min(1).optional(),
});

export const moveWishlistItemBodySchema = z.object({
  fromCollectionId: nonEmptyString("fromCollectionId"),
  toCollectionId: nonEmptyString("toCollectionId"),
});
