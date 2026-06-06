#!/usr/bin/env node
/**
 * scripts/validate-openapi.js
 *
 * Validates docs/openapi.yaml against the OpenAPI 3.0 spec.
 *
 * Usage:
 *   node scripts/validate-openapi.js
 *   # or as an npm script: "validate:api": "node scripts/validate-openapi.js"
 *
 * Requires:
 *   npm install --save-dev @apidevtools/swagger-parser
 */

"use strict";

const path = require("path");
const SwaggerParser = require("@apidevtools/swagger-parser");

const SPEC_PATH = path.resolve(__dirname, "../docs/openapi.yaml");

(async () => {
  try {
    console.log("🔍 Validating OpenAPI spec …");
    const api = await SwaggerParser.validate(SPEC_PATH);
    console.log(`✅  Valid — "${api.info.title}" v${api.info.version}`);
    console.log(`   Paths: ${Object.keys(api.paths).length}`);
    console.log(
      `   Schemas: ${Object.keys(api.components?.schemas ?? {}).length}`,
    );
    process.exit(0);
  } catch (err) {
    console.error("❌  Validation failed:\n", err.message);
    process.exit(1);
  }
})();
