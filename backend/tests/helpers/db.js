import mongoose from "mongoose";

export async function connectTestDB() {
  if (mongoose.connection.readyState === 0) {
    const uri =
      process.env.TEST_MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust_test";
    const databaseName = new URL(uri).pathname
      .replace(/^\/+/, "")
      .split("/")[0];
    if (!/(?:^|[_-])test$/i.test(databaseName)) {
      throw new Error(
        "TEST_MONGO_URL must point to a database whose name ends with _test",
      );
    }
    await mongoose.connect(uri);
  }
}

export async function disconnectTestDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

export async function clearCollections() {
  if (mongoose.connection.readyState !== 1) return;
  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}
