import path from "path";
import { fileURLToPath } from "url";
import SwaggerParser from "@apidevtools/swagger-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPEC_PATH = path.resolve(__dirname, "../../../docs/openapi.yaml");

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
