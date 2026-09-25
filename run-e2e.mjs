import { MongoClient } from "mongodb";
import { spawn } from "child_process";

(async () => {
  const uri = "mongodb://127.0.0.1:27017/wanderlust_test_e2e_run";
  console.log(`✅ Using local MongoDB at ${uri}`);

  console.log("🔄 Dropping old test database...");
  const client = new MongoClient(uri);
  await client.connect();
  await client.db().dropDatabase();
  await client.close();

  const env = {
    ...process.env,
    MONGO_URL: uri,
    NODE_ENV: "development",
    CORS_ORIGINS: "http://127.0.0.1:5173,http://localhost:5173",
  };

  console.log("🚀 Launching Playwright...");
  const pw = spawn("npx", ["playwright", "test"], {
    stdio: "inherit",
    shell: true,
    env,
  });

  pw.on("close", async (code) => {
    console.log("🛑 Tests finished.");
    process.exit(code);
  });
})();
