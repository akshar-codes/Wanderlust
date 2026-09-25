import { MongoClient } from "mongodb";
import { spawn } from "child_process";

async function runE2E() {
  const uri = "mongodb://127.0.0.1:27017/wanderlust_test_e2e_run?replicaSet=rs0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    await client.db().dropDatabase();
  } finally {
    await client.close();
  }

  const env = {
    ...process.env,
    MONGO_URL: uri,
    NODE_ENV: "development",
    CORS_ORIGINS: "http://127.0.0.1:5173,http://localhost:5173",
  };

  const code = await new Promise((resolve, reject) => {
    const playwright = spawn("npx", ["playwright", "test"], {
      stdio: "inherit",
      shell: true,
      env,
    });
    playwright.once("error", reject);
    playwright.once("close", (exitCode) => resolve(exitCode ?? 1));
  });
  process.exitCode = code;
}

runE2E().catch((error) => {
  console.error("Could not start the E2E environment:", error);
  process.exitCode = 1;
});
