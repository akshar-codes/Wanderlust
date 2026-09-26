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

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const optionalCredential = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const prodSchema = baseSchema
  .extend({
    CLOUD_NAME: z.string().min(1),
    CLOUD_API_KEY: z.string().min(1),
    CLOUD_API_SECRET: z.string().min(1),
    FRONTEND_URL: z
      .string()
      .url("FRONTEND_URL must be an absolute URL")
      .refine((value) => new URL(value).protocol === "https:", {
        message: "FRONTEND_URL must use HTTPS in production",
      }),
    SMTP_HOST: z.string().min(1, "SMTP_HOST is required in production"),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    SMTP_SECURE: z.enum(["true", "false"]).default("false"),
    SMTP_USER: z.string().min(1, "SMTP_USER is required in production"),
    SMTP_PASS: z.string().min(1, "SMTP_PASS is required in production"),
    BASE_URL: optionalUrl,
    GOOGLE_CLIENT_ID: optionalCredential,
    GOOGLE_CLIENT_SECRET: optionalCredential,
    GITHUB_CLIENT_ID: optionalCredential,
    GITHUB_CLIENT_SECRET: optionalCredential,
  })
  .superRefine((env, ctx) => {
    for (const provider of ["GOOGLE", "GITHUB"]) {
      const id = env[`${provider}_CLIENT_ID`];
      const secret = env[`${provider}_CLIENT_SECRET`];
      if (Boolean(id) !== Boolean(secret)) {
        ctx.addIssue({
          code: "custom",
          path: [`${provider}_CLIENT_ID`],
          message: `${provider}_CLIENT_ID and ${provider}_CLIENT_SECRET must be set together`,
        });
      }
      if (
        id &&
        secret &&
        (!env.BASE_URL || new URL(env.BASE_URL).protocol !== "https:")
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["BASE_URL"],
          message: "BASE_URL must be an HTTPS URL when OAuth is enabled",
        });
      }
    }
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
