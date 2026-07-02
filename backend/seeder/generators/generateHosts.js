import {
  randomInt,
  randomFloat,
  pick,
  pickRange,
  chance,
  randomPastDate,
  slugify,
} from "../utils/random.js";
import { FIRST_NAMES, LAST_NAMES, LANGUAGE_OPTIONS } from "../data/names.js";

const HOST_COUNT = 150;
const SEED_PASSWORD = "Wanderlust@2025";

let usedUsernames = new Set();

function uniqueUsername(first, last) {
  let base = `${first}${last}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  let candidate = base;
  let n = 1;
  while (usedUsernames.has(candidate)) {
    candidate = `${base}${n}`;
    n++;
  }
  usedUsernames.add(candidate);
  return candidate;
}

function avatarUrl(seed) {
  // DiceBear avatars — deterministic, real, loadable, no API key required.
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export function buildHostDescriptors(count = HOST_COUNT) {
  usedUsernames = new Set();
  const descriptors = [];

  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const username = uniqueUsername(firstName, lastName);
    const email = `${username}@wanderlust-hosts.com`;

    const joinedAt = randomPastDate(365 * 6, 30); // 30 days - 6 years ago
    const isSuperhost = chance(0.35);
    const responseRate = isSuperhost ? randomInt(95, 100) : randomInt(70, 99);
    const responseTimeOptions = isSuperhost
      ? ["within an hour", "within a few hours"]
      : ["within a few hours", "within a day"];
    const responseTime = pick(responseTimeOptions);
    const languages = pickRange(LANGUAGE_OPTIONS, 1, 4);
    if (!languages.includes("English")) languages.unshift("English");

    const bioParts = [
      `Hosting on Wanderlust since ${joinedAt.getFullYear()}.`,
      isSuperhost
        ? "Proud Superhost known for fast responses and spotless stays."
        : "Passionate about giving guests a comfortable, memorable stay.",
      `Usually responds ${responseTime}.`,
      languages.length > 1
        ? `Speaks ${languages.join(", ")}.`
        : "Speaks English.",
    ];

    descriptors.push({
      username,
      email,
      firstName,
      lastName,
      bio: bioParts.join(" "),
      role: "host",
      provider: "local",
      emailVerified: true,
      avatarUrl: avatarUrl(username),
      hostMeta: {
        joinedAt,
        isSuperhost,
        responseRate,
        responseTime,
        languages,
        verified: chance(0.85),
      },
    });
  }

  return descriptors;
}

export { SEED_PASSWORD };

export async function registerHosts(UserModel, descriptors) {
  const created = [];

  for (const d of descriptors) {
    const userDoc = new UserModel({
      username: d.username,
      email: d.email,
      firstName: d.firstName,
      lastName: d.lastName,
      bio: d.bio,
      role: d.role,
      provider: d.provider,
      emailVerified: d.emailVerified,
      avatar: { url: d.avatarUrl, filename: null, publicId: null },
    });

    const registered = await UserModel.register(userDoc, SEED_PASSWORD);
    created.push({ user: registered, hostMeta: d.hostMeta });
  }

  return created;
}
