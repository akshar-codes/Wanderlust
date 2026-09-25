import { MongoClient } from "mongodb";

export async function seedUser(role = "guest") {
  const seed = Date.now();
  const username = `${role}_${seed}`;
  const email = `${role}_${seed}@example.com`;

  // 1. Get CSRF Token
  const meRes = await fetch("http://127.0.0.1:8080/api/auth/me");
  const cookies = meRes.headers.get("set-cookie") || "";
  const csrfMatch = cookies.match(/csrf_token=([^;]+)/);
  const csrfToken = csrfMatch ? csrfMatch[1] : "";

  // 2. Register user
  const res = await fetch("http://127.0.0.1:8080/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
      Cookie: `csrf_token=${csrfToken}`,
    },
    body: JSON.stringify({
      username,
      email,
      password: "Password123!",
      firstName: "Test",
      lastName: "User",
    }),
  });
  const data = await res.json();
  if (!res.ok) console.error("seedUser error:", data);

  // 3. Elevate role if necessary
  if (role !== "guest") {
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    const db = client.db();
    await db.collection("users").updateOne({ username }, { $set: { role } });
    await client.close();
  }

  return { username, email };
}
