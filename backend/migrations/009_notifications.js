import mongoose from "mongoose";

export default async function migrate() {
  const db = mongoose.connection.db;

  const collections = await db.listCollections({ name: "notifications" }).toArray();
  if (collections.length === 0) {
    await db.createCollection("notifications");
  }

  const notifications = db.collection("notifications");

  await notifications.createIndex({ recipient: 1, createdAt: -1 });
  await notifications.createIndex({ recipient: 1, read: 1 });

  console.log("Migration 009: Notifications collection and indexes created.");
}

// Run directly if called via CLI
if (process.argv[1] === new URL(import.meta.url).pathname) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      await migrate();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
