import { describe, it, expect } from "vitest";
import {
  requireAuth,
  requireRole,
  requireMinRole,
  requirePermission,
  requireSelfOrAdmin,
  requireOwnerOrAdmin,
  requireActiveAccount,
  requireAuthAndPermission,
} from "../../../src/middlewares/rbac.js";

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

function capture(middleware, req) {
  return new Promise((resolve) => {
    middleware(req, {}, resolve);
  });
}

describe("RBAC Middlewares", () => {
  describe("requireAuth", () => {
    it("passes for authenticated user", async () => {
      const err = await capture(
        requireAuth(),
        makeReq({ authenticated: true, role: "user" }),
      );
      expect(err).toBeUndefined();
    });

    it("returns 401 for unauthenticated request", async () => {
      const err = await capture(
        requireAuth(),
        makeReq({ authenticated: false }),
      );
      expect(err?.statusCode).toBe(401);
    });
  });

  describe("requireRole", () => {
    it("passes when role matches exactly", async () => {
      const err = await capture(
        requireRole("admin"),
        makeReq({ authenticated: true, role: "admin" }),
      );
      expect(err).toBeUndefined();
    });

    it("passes when role is in multi-role list", async () => {
      const err = await capture(
        requireRole("host", "admin"),
        makeReq({ authenticated: true, role: "host" }),
      );
      expect(err).toBeUndefined();
    });

    it("returns 403 when role is not in allowed list", async () => {
      const err = await capture(
        requireRole("admin"),
        makeReq({ authenticated: true, role: "user" }),
      );
      expect(err?.statusCode).toBe(403);
    });

    it("returns 401 when unauthenticated", async () => {
      const err = await capture(
        requireRole("admin"),
        makeReq({ authenticated: false }),
      );
      expect(err?.statusCode).toBe(401);
    });

    it("throws at construction with unknown role", () => {
      expect(() => requireRole("superuser")).toThrow(/unknown roles/);
    });
  });

  describe("requireMinRole", () => {
    it("passes sufficient roles", async () => {
      expect(
        await capture(
          requireMinRole("host"),
          makeReq({ authenticated: true, role: "host" }),
        ),
      ).toBeUndefined();
      expect(
        await capture(
          requireMinRole("host"),
          makeReq({ authenticated: true, role: "admin" }),
        ),
      ).toBeUndefined();
    });

    it("fails insufficient roles with 403", async () => {
      expect(
        (
          await capture(
            requireMinRole("host"),
            makeReq({ authenticated: true, role: "user" }),
          )
        )?.statusCode,
      ).toBe(403);
      expect(
        (
          await capture(
            requireMinRole("admin"),
            makeReq({ authenticated: true, role: "host" }),
          )
        )?.statusCode,
      ).toBe(403);
    });
  });

  describe("requirePermission", () => {
    it("passes authorized roles", async () => {
      expect(
        await capture(
          requirePermission("listing", "create"),
          makeReq({ authenticated: true, role: "host" }),
        ),
      ).toBeUndefined();
      expect(
        await capture(
          requirePermission("listing", "feature"),
          makeReq({ authenticated: true, role: "admin" }),
        ),
      ).toBeUndefined();
    });

    it("fails unauthorized roles", async () => {
      expect(
        (
          await capture(
            requirePermission("listing", "create"),
            makeReq({ authenticated: true, role: "user" }),
          )
        )?.statusCode,
      ).toBe(403);
    });

    it("public permission passes unauthenticated", async () => {
      expect(
        await capture(
          requirePermission("auth", "signup"),
          makeReq({ authenticated: false }),
        ),
      ).toBeUndefined();
    });
  });

  describe("requireSelfOrAdmin", () => {
    it("passes when username matches", async () => {
      const req = makeReq({
        authenticated: true,
        role: "user",
        username: "akshar",
        params: { username: "akshar" },
      });
      expect(await capture(requireSelfOrAdmin(), req)).toBeUndefined();
    });

    it("passes for admin regardless of username", async () => {
      const req = makeReq({
        authenticated: true,
        role: "admin",
        username: "adminuser",
        params: { username: "someone_else" },
      });
      expect(await capture(requireSelfOrAdmin(), req)).toBeUndefined();
    });

    it("fails when user accesses another user", async () => {
      const req = makeReq({
        authenticated: true,
        role: "user",
        username: "akshar",
        params: { username: "otheruser" },
      });
      expect((await capture(requireSelfOrAdmin(), req))?.statusCode).toBe(403);
    });
  });

  describe("requireOwnerOrAdmin", () => {
    it("passes when req.user._id matches owner and attaches resource", async () => {
      const doc = {
        owner: {
          toString: () => "user-id-123",
          equals: (v) => v.toString() === "user-id-123",
        },
      };
      const req = makeReq({
        authenticated: true,
        role: "host",
        username: "host1",
      });
      const err = await capture(
        requireOwnerOrAdmin(async () => doc, "owner", "Listing"),
        req,
      );
      expect(err).toBeUndefined();
      expect(req.resource).toBe(doc);
    });

    it("passes for admin even when not owner", async () => {
      const doc = {
        owner: { toString: () => "someone-else", equals: () => false },
      };
      const req = makeReq({ authenticated: true, role: "admin" });
      expect(
        await capture(
          requireOwnerOrAdmin(async () => doc, "owner", "Listing"),
          req,
        ),
      ).toBeUndefined();
    });

    it("fails for non-owner user", async () => {
      const doc = { owner: { toString: () => "other", equals: () => false } };
      const req = makeReq({ authenticated: true, role: "host" });
      expect(
        (
          await capture(
            requireOwnerOrAdmin(async () => doc, "owner", "Listing"),
            req,
          )
        )?.statusCode,
      ).toBe(403);
    });

    it("returns 404 if resource not found", async () => {
      const req = makeReq({ authenticated: true, role: "host" });
      expect(
        (
          await capture(
            requireOwnerOrAdmin(async () => null, "owner", "Listing"),
            req,
          )
        )?.statusCode,
      ).toBe(404);
    });
  });

  describe("requireActiveAccount", () => {
    it("passes active user", async () => {
      expect(
        await capture(
          requireActiveAccount(),
          makeReq({ authenticated: true, role: "user", isActive: true }),
        ),
      ).toBeUndefined();
    });

    it("403 and logout for deactivated account", async () => {
      let loggedOut = false;
      const req = {
        isAuthenticated: () => true,
        user: { role: "user", isActive: false },
        logout: (cb) => {
          loggedOut = true;
          cb(null);
        },
        params: {},
      };
      const err = await capture(requireActiveAccount(), req);
      expect(err?.statusCode).toBe(403);
      expect(loggedOut).toBe(true);
    });

    it("403 and logout when isActive is undefined (pre-migration user)", async () => {
      let loggedOut = false;
      const req = {
        isAuthenticated: () => true,
        user: { role: "user" },
        logout: (cb) => {
          loggedOut = true;
          cb(null);
        },
        params: {},
      };
      const err = await capture(requireActiveAccount(), req);
      expect(err?.statusCode).toBe(403);
      expect(loggedOut).toBe(true);
    });
  });

  describe("requireAuthAndPermission", () => {
    it("passes authorized", async () => {
      expect(
        await capture(
          requireAuthAndPermission("listing", "create"),
          makeReq({ authenticated: true, role: "host" }),
        ),
      ).toBeUndefined();
    });

    it("fails unauthorized", async () => {
      expect(
        (
          await capture(
            requireAuthAndPermission("listing", "create"),
            makeReq({ authenticated: false }),
          )
        )?.statusCode,
      ).toBe(401);
      expect(
        (
          await capture(
            requireAuthAndPermission("listing", "create"),
            makeReq({ authenticated: true, role: "user" }),
          )
        )?.statusCode,
      ).toBe(403);
    });
  });
});
