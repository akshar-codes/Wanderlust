import { z } from "zod";

const baseSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGO_URL: z.string().min(1, "MONGO_URL is required"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be >=32 chars"),
  MAP_TOKEN: z.string().min(1, "MAP_TOKEN is required"),
});

const prodSchema = baseSchema.extend({
  CLOUD_NAME: z.string().min(1),
  CLOUD_API_KEY: z.string().min(1),
  CLOUD_API_SECRET: z.string().min(1),
});

const schema = process.env.NODE_ENV === "production" ? prodSchema : baseSchema;
const result = schema.safeParse(process.env);

if (!result.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(result.error.format(), null, 2),
  );
  process.exit(1);
}

export default result.data;
