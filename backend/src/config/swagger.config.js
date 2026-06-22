import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function setupSwagger(app) {
  // ── Guard: disable in production ──────────────────────────────────────────
  if (
    process.env.SWAGGER_ENABLED !== "true" &&
    process.env.NODE_ENV === "production"
  ) {
    return;
  }

  // ── Load spec from disk ───────────────────────────────────────────────────
  const specPath = path.resolve(__dirname, "../../../docs/openapi.yaml");

  let spec;
  try {
    const raw = fs.readFileSync(specPath, "utf8");
    spec = yaml.load(raw);
  } catch (err) {
    console.error("[Swagger] Failed to load openapi.yaml:", err.message);
    return;
  }

  // ── Override servers[] dynamically from env ───────────────────────────────
  const baseUrl =
    process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 8080}`;
  spec.servers = [
    { url: baseUrl, description: "Current environment" },
    ...(spec.servers ?? []).filter((s) => s.url !== baseUrl),
  ];

  // ── Swagger UI options ────────────────────────────────────────────────────
  const uiOptions = {
    customSiteTitle: "Wanderlust API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
    },
    customCss: `
      .swagger-ui .topbar { background-color: #fe424d; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
    `,
  };

  // ── Mount ─────────────────────────────────────────────────────────────────
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec, uiOptions));

  app.get("/api/docs/openapi.json", (_req, res) => res.json(spec));

  console.log(`[Swagger] UI available at ${baseUrl}/api/docs`);
}
