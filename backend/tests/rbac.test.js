"use strict";

const assert = require("assert");
const {
  ROLES,
  ROLE_HIERARCHY,
  can,
  hasMinimumRole,
  getAllowedActions,
} = require("../src/middlewares/permissions");

const {
  requireAuth,
  requireRole,
  requireMinRole,
  requirePermission,
  requireSelfOrAdmin,
  requireOwnerOrAdmin,
  requireActiveAccount,
  requireAuthAndPermission,
} = require("../src/middlewares/rbac");

// ── Test helpers ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✅  ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ❌  ${description}`);
    console.error(`       ${err.message}`);
    failed++;
  }
}

/** Build a minimal mock req object. */
function makeReq({
  authenticated = false,
  role = null,
  username = null,
  isActive = true,
  params = {},
} = {}) {
  return {
    isAuthenticated: () => authenticated,
    user: authenticated
      ? {
          _id: {
            toString: () => "user-id-123",
            equals: (v) => v.toString() === "user-id-123",
          },
          role,
          username,
          isActive,
        }
      : undefined,
    params,
    logout: (cb) => cb(null),
  };
}

/** Capture the error passed to next(). */
function capture(middleware, req) {
  return new Promise((resolve) => {
    middleware(req, {}, resolve);
  });
}

// ── Section 1: permissions.js ──────────────────────────────────────────────────

console.log("\n── permissions.js ────────────────────────────────────────────");

test("ROLES constants are frozen", () => {
  assert.throws(() => {
    ROLES.NEW_ROLE = "x";
  }, TypeError);
});

test("ROLE_HIERARCHY has correct order", () => {
  assert.deepStrictEqual(ROLE_HIERARCHY, ["user", "host", "admin"]);
});

test("can(): user can read listings", () => {
  assert.strictEqual(can(ROLES.USER, "listing", "read"), true);
});

test("can(): user cannot create listings", () => {
  assert.strictEqual(can(ROLES.USER, "listing", "create"), false);
});

test("can(): host can create listings", () => {
  assert.strictEqual(can(ROLES.HOST, "listing", "create"), true);
});

test("can(): admin can feature listings", () => {
  assert.strictEqual(can(ROLES.ADMIN, "listing", "feature"), true);
});

test("can(): host cannot feature listings", () => {
  assert.strictEqual(can(ROLES.HOST, "listing", "feature"), false);
});

test("can(): user cannot feature listings", () => {
  assert.strictEqual(can(ROLES.USER, "listing", "feature"), false);
});

test("can(): all roles can create reviews", () => {
  assert.ok(can(ROLES.USER, "review", "create"));
  assert.ok(can(ROLES.HOST, "review", "create"));
  assert.ok(can(ROLES.ADMIN, "review", "create"));
});

test("can(): only admin can deleteAny review", () => {
  assert.strictEqual(can(ROLES.USER, "review", "deleteAny"), false);
  assert.strictEqual(can(ROLES.HOST, "review", "deleteAny"), false);
  assert.strictEqual(can(ROLES.ADMIN, "review", "deleteAny"), true);
});

test("can(): only admin can changeRole", () => {
  assert.strictEqual(can(ROLES.USER, "user", "changeRole"), false);
  assert.strictEqual(can(ROLES.HOST, "user", "changeRole"), false);
  assert.strictEqual(can(ROLES.ADMIN, "user", "changeRole"), true);
});

test("can(): unknown resource returns false", () => {
  assert.strictEqual(can(ROLES.ADMIN, "nonexistent", "read"), false);
});

test("hasMinimumRole(): user >= user", () => {
  assert.strictEqual(hasMinimumRole(ROLES.USER, ROLES.USER), true);
});

test("hasMinimumRole(): host >= user", () => {
  assert.strictEqual(hasMinimumRole(ROLES.HOST, ROLES.USER), true);
});

test("hasMinimumRole(): admin >= host", () => {
  assert.strictEqual(hasMinimumRole(ROLES.ADMIN, ROLES.HOST), true);
});

test("hasMinimumRole(): user < host", () => {
  assert.strictEqual(hasMinimumRole(ROLES.USER, ROLES.HOST), false);
});

test("hasMinimumRole(): host < admin", () => {
  assert.strictEqual(hasMinimumRole(ROLES.HOST, ROLES.ADMIN), false);
});

test("getAllowedActions(): admin has all listing actions", () => {
  const actions = getAllowedActions(ROLES.ADMIN, "listing");
  [
    "read",
    "create",
    "update",
    "delete",
    "publish",
    "feature",
    "viewDrafts",
    "viewAnyDraft",
  ].forEach((a) => {
    assert.ok(actions.includes(a), `Expected admin to have listing.${a}`);
  });
});

test("getAllowedActions(): user has only listing.read + viewDrafts", () => {
  const actions = getAllowedActions(ROLES.USER, "listing");
  assert.ok(actions.includes("read"));
  assert.ok(!actions.includes("create"), "user should not have listing.create");
  assert.ok(
    !actions.includes("feature"),
    "user should not have listing.feature",
  );
});

test("getAllowedActions(): unknown resource returns []", () => {
  assert.deepStrictEqual(getAllowedActions(ROLES.ADMIN, "ghost"), []);
});

// ── Section 2: requireAuth ────────────────────────────────────────────────────

console.log("\n── requireAuth() ─────────────────────────────────────────────");

test("passes for authenticated user", async () => {
  const err = await capture(
    requireAuth(),
    makeReq({ authenticated: true, role: "user" }),
  );
  assert.strictEqual(err, undefined);
});

test("401 for unauthenticated request", async () => {
  const err = await capture(requireAuth(), makeReq({ authenticated: false }));
  assert.strictEqual(err?.statusCode, 401);
});

// ── Section 3: requireRole ────────────────────────────────────────────────────

console.log("\n── requireRole() ─────────────────────────────────────────────");

test("passes when role matches exactly", async () => {
  const err = await capture(
    requireRole("admin"),
    makeReq({ authenticated: true, role: "admin" }),
  );
  assert.strictEqual(err, undefined);
});

test("passes when role is in multi-role list", async () => {
  const err = await capture(
    requireRole("host", "admin"),
    makeReq({ authenticated: true, role: "host" }),
  );
  assert.strictEqual(err, undefined);
});

test("403 when role is not in allowed list", async () => {
  const err = await capture(
    requireRole("admin"),
    makeReq({ authenticated: true, role: "user" }),
  );
  assert.strictEqual(err?.statusCode, 403);
});

test("401 when unauthenticated", async () => {
  const err = await capture(
    requireRole("admin"),
    makeReq({ authenticated: false }),
  );
  assert.strictEqual(err?.statusCode, 401);
});

test("throws at construction with unknown role", () => {
  assert.throws(() => requireRole("superuser"), /unknown roles/);
});

test("throws at construction with no arguments", () => {
  assert.throws(() => requireRole(), /at least one role/);
});

// ── Section 4: requireMinRole ─────────────────────────────────────────────────

console.log("\n── requireMinRole() ──────────────────────────────────────────");

test("host passes requireMinRole(host)", async () => {
  const err = await capture(
    requireMinRole("host"),
    makeReq({ authenticated: true, role: "host" }),
  );
  assert.strictEqual(err, undefined);
});

test("admin passes requireMinRole(host)", async () => {
  const err = await capture(
    requireMinRole("host"),
    makeReq({ authenticated: true, role: "admin" }),
  );
  assert.strictEqual(err, undefined);
});

test("user fails requireMinRole(host)", async () => {
  const err = await capture(
    requireMinRole("host"),
    makeReq({ authenticated: true, role: "user" }),
  );
  assert.strictEqual(err?.statusCode, 403);
});

test("host fails requireMinRole(admin)", async () => {
  const err = await capture(
    requireMinRole("admin"),
    makeReq({ authenticated: true, role: "host" }),
  );
  assert.strictEqual(err?.statusCode, 403);
});

test("throws at construction with unknown role", () => {
  assert.throws(() => requireMinRole("superadmin"), /unknown role/);
});

// ── Section 5: requirePermission ─────────────────────────────────────────────

console.log("\n── requirePermission() ───────────────────────────────────────");

test("host passes listing.create", async () => {
  const err = await capture(
    requirePermission("listing", "create"),
    makeReq({ authenticated: true, role: "host" }),
  );
  assert.strictEqual(err, undefined);
});

test("user fails listing.create", async () => {
  const err = await capture(
    requirePermission("listing", "create"),
    makeReq({ authenticated: true, role: "user" }),
  );
  assert.strictEqual(err?.statusCode, 403);
});

test("admin passes listing.feature", async () => {
  const err = await capture(
    requirePermission("listing", "feature"),
    makeReq({ authenticated: true, role: "admin" }),
  );
  assert.strictEqual(err, undefined);
});

test("host fails listing.feature", async () => {
  const err = await capture(
    requirePermission("listing", "feature"),
    makeReq({ authenticated: true, role: "host" }),
  );
  assert.strictEqual(err?.statusCode, 403);
});

test("401 when unauthenticated on protected permission", async () => {
  const err = await capture(
    requirePermission("listing", "create"),
    makeReq({ authenticated: false }),
  );
  assert.strictEqual(err?.statusCode, 401);
});

test("public permission (empty roles set) passes unauthenticated", async () => {
  const err = await capture(
    requirePermission("auth", "signup"),
    makeReq({ authenticated: false }),
  );
  assert.strictEqual(err, undefined);
});

test("throws at construction for unknown permission", () => {
  assert.throws(
    () => requirePermission("listing", "fly"),
    /unknown permission/,
  );
});

// ── Section 6: requireSelfOrAdmin ────────────────────────────────────────────

console.log("\n── requireSelfOrAdmin() ──────────────────────────────────────");

test("passes when username matches param", async () => {
  const req = makeReq({
    authenticated: true,
    role: "user",
    username: "akshar",
    params: { username: "akshar" },
  });
  const err = await capture(requireSelfOrAdmin(), req);
  assert.strictEqual(err, undefined);
});

test("passes for admin regardless of username", async () => {
  const req = makeReq({
    authenticated: true,
    role: "admin",
    username: "adminuser",
    params: { username: "someone_else" },
  });
  const err = await capture(requireSelfOrAdmin(), req);
  assert.strictEqual(err, undefined);
});

test("403 when user tries to access another user's resource", async () => {
  const req = makeReq({
    authenticated: true,
    role: "user",
    username: "akshar",
    params: { username: "otheruser" },
  });
  const err = await capture(requireSelfOrAdmin(), req);
  assert.strictEqual(err?.statusCode, 403);
});

test("custom param name is supported", async () => {
  const req = makeReq({
    authenticated: true,
    role: "user",
    username: "akshar",
    params: { target: "akshar" },
  });
  const err = await capture(requireSelfOrAdmin("target"), req);
  assert.strictEqual(err, undefined);
});

// ── Section 7: requireOwnerOrAdmin ────────────────────────────────────────────

console.log("\n── requireOwnerOrAdmin() ─────────────────────────────────────");

test("passes when req.user._id matches owner", async () => {
  const doc = {
    owner: {
      toString: () => "user-id-123",
      equals: (v) => v.toString() === "user-id-123",
    },
  };
  const fetchFn = async () => doc;
  const req = makeReq({ authenticated: true, role: "host", username: "host1" });

  const err = await capture(
    requireOwnerOrAdmin(fetchFn, "owner", "Listing"),
    req,
  );
  assert.strictEqual(err, undefined);
  assert.strictEqual(req.resource, doc); // doc attached
});

test("passes for admin even when not owner", async () => {
  const doc = {
    owner: { toString: () => "someone-else", equals: () => false },
  };
  const fetchFn = async () => doc;
  const req = makeReq({ authenticated: true, role: "admin" });

  const err = await capture(
    requireOwnerOrAdmin(fetchFn, "owner", "Listing"),
    req,
  );
  assert.strictEqual(err, undefined);
});

test("403 when non-owner user tries to access resource", async () => {
  const doc = {
    owner: { toString: () => "other-user-id", equals: () => false },
  };
  const fetchFn = async () => doc;
  const req = makeReq({ authenticated: true, role: "host" });

  const err = await capture(
    requireOwnerOrAdmin(fetchFn, "owner", "Listing"),
    req,
  );
  assert.strictEqual(err?.statusCode, 403);
});

test("404 when resource not found", async () => {
  const fetchFn = async () => null;
  const req = makeReq({ authenticated: true, role: "host" });

  const err = await capture(
    requireOwnerOrAdmin(fetchFn, "owner", "Listing"),
    req,
  );
  assert.strictEqual(err?.statusCode, 404);
});

test("401 when unauthenticated", async () => {
  const fetchFn = async () => ({ owner: "x" });
  const req = makeReq({ authenticated: false });

  const err = await capture(requireOwnerOrAdmin(fetchFn), req);
  assert.strictEqual(err?.statusCode, 401);
});

// ── Section 8: requireActiveAccount ──────────────────────────────────────────

console.log("\n── requireActiveAccount() ────────────────────────────────────");

test("passes for active authenticated user", async () => {
  const err = await capture(
    requireActiveAccount(),
    makeReq({ authenticated: true, role: "user", isActive: true }),
  );
  assert.strictEqual(err, undefined);
});

test("passes through unauthenticated request silently", async () => {
  const err = await capture(
    requireActiveAccount(),
    makeReq({ authenticated: false }),
  );
  assert.strictEqual(err, undefined);
});

test("403 + logout for deactivated account", async () => {
  let logoutCalled = false;
  const req = {
    isAuthenticated: () => true,
    user: { role: "user", isActive: false },
    logout: (cb) => {
      logoutCalled = true;
      cb(null);
    },
    params: {},
  };

  const err = await capture(requireActiveAccount(), req);
  assert.strictEqual(err?.statusCode, 403);
  assert.ok(logoutCalled, "logout() should have been called");
});

// ── Section 9: requireAuthAndPermission ──────────────────────────────────────

console.log("\n── requireAuthAndPermission() ────────────────────────────────");

test("passes authenticated host for listing.create", async () => {
  const err = await capture(
    requireAuthAndPermission("listing", "create"),
    makeReq({ authenticated: true, role: "host" }),
  );
  assert.strictEqual(err, undefined);
});

test("401 when unauthenticated", async () => {
  const err = await capture(
    requireAuthAndPermission("listing", "create"),
    makeReq({ authenticated: false }),
  );
  assert.strictEqual(err?.statusCode, 401);
});

test("403 when authenticated but wrong role (user for listing.create)", async () => {
  const err = await capture(
    requireAuthAndPermission("listing", "create"),
    makeReq({ authenticated: true, role: "user" }),
  );
  assert.strictEqual(err?.statusCode, 403);
});

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("Some tests failed.");
  process.exit(1);
} else {
  console.log("All tests passed ✅");
}

// ── Regression: isActive undefined (pre-migration seed docs) ─────────────────

console.log("\n── requireActiveAccount() — regression ───────────────────────");

test("403 + logout when isActive is undefined (pre-migration document)", async () => {
  let logoutCalled = false;
  const req = {
    isAuthenticated: () => true,
    user: { role: "user" }, // isActive field absent entirely
    logout: (cb) => {
      logoutCalled = true;
      cb(null);
    },
    params: {},
  };

  const err = await capture(requireActiveAccount(), req);
  assert.strictEqual(err?.statusCode, 403, "should be 403");
  assert.ok(logoutCalled, "logout() should have been called");
});

test("passes when isActive is true (normal active user)", async () => {
  const err = await capture(
    requireActiveAccount(),
    makeReq({ authenticated: true, role: "user", isActive: true }),
  );
  assert.strictEqual(err, undefined);
});

// ── Re-print summary ──────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`Final: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
