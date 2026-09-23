import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export async function connectTestDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust_test",
    );
  }
}

export async function disconnectTestDB() {
  await mongoose.disconnect();
}

export async function clearCollections() {
  if (mongoose.connection.readyState !== 1) return;
  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}
