"use strict";

const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const swaggerUi = require("swagger-ui-express");

/**
 * Mount Swagger UI onto the Express app.
 *
 * @param {import("express").Application} app
 */
function setupSwagger(app) {
  // ── Guard: disable in production ──────────────────────────────────────────
  if (
    process.env.SWAGGER_ENABLED !== "true" &&
    process.env.NODE_ENV === "production"
  ) {
    return;
  }

  // ── Load spec from disk (supports hot-reload in dev) ─────────────────────
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

    // Show the "Authorize" button; lets testers log in via the UI
    swaggerOptions: {
      persistAuthorization: true, // remembers credentials across refreshes
      withCredentials: true, // sends session cookie automatically
      displayRequestDuration: true, // shows response-time in each call
      filter: true, // adds a search/filter box for tags
      tryItOutEnabled: true, // opens "Try it out" by default
      requestSnippetsEnabled: true, // shows code snippets (curl, JS, etc.)
    },

    // Inject minimal custom CSS
    customCss: `
      .swagger-ui .topbar { background-color: #fe424d; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
    `,
  };

  // ── Mount ─────────────────────────────────────────────────────────────────
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec, uiOptions));

  // Also serve the raw spec (useful for code-gen tools, Postman import, etc.)
  app.get("/api/docs/openapi.json", (_req, res) => res.json(spec));

  console.log(`[Swagger] UI available at ${baseUrl}/api/docs`);
}

module.exports = setupSwagger;
