import { z } from "zod";

export const createMessageBodySchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message cannot exceed 2000 characters"),
});
