import { describe, it, expect } from "vitest";
import {
  ROLES,
  ROLE_HIERARCHY,
  can,
  hasMinimumRole,
  getAllowedActions,
} from "../../../src/middlewares/permissions.js";

describe("Permissions", () => {
  describe("Constants", () => {
    it("ROLES constants are frozen", () => {
      expect(() => {
        ROLES.NEW_ROLE = "x";
      }).toThrow(TypeError);
    });

    it("ROLE_HIERARCHY has correct order", () => {
      expect(ROLE_HIERARCHY).toEqual(["user", "host", "admin"]);
    });
  });

  describe("can()", () => {
    it("user can read listings", () => {
      expect(can(ROLES.USER, "listing", "read")).toBe(true);
    });

    it("user cannot create listings", () => {
      expect(can(ROLES.USER, "listing", "create")).toBe(false);
    });

    it("host can create listings", () => {
      expect(can(ROLES.HOST, "listing", "create")).toBe(true);
    });

    it("admin can feature listings", () => {
      expect(can(ROLES.ADMIN, "listing", "feature")).toBe(true);
    });

    it("host cannot feature listings", () => {
      expect(can(ROLES.HOST, "listing", "feature")).toBe(false);
    });

    it("user cannot feature listings", () => {
      expect(can(ROLES.USER, "listing", "feature")).toBe(false);
    });

    it("all roles can create reviews", () => {
      expect(can(ROLES.USER, "review", "create")).toBe(true);
      expect(can(ROLES.HOST, "review", "create")).toBe(true);
      expect(can(ROLES.ADMIN, "review", "create")).toBe(true);
    });

    it("only admin can deleteAny review", () => {
      expect(can(ROLES.USER, "review", "deleteAny")).toBe(false);
      expect(can(ROLES.HOST, "review", "deleteAny")).toBe(false);
      expect(can(ROLES.ADMIN, "review", "deleteAny")).toBe(true);
    });

    it("only admin can changeRole", () => {
      expect(can(ROLES.USER, "user", "changeRole")).toBe(false);
      expect(can(ROLES.HOST, "user", "changeRole")).toBe(false);
      expect(can(ROLES.ADMIN, "user", "changeRole")).toBe(true);
    });

    it("unknown resource returns false", () => {
      expect(can(ROLES.ADMIN, "nonexistent", "read")).toBe(false);
    });
  });

  describe("hasMinimumRole()", () => {
    it("returns correct hierarchical checks", () => {
      expect(hasMinimumRole(ROLES.USER, ROLES.USER)).toBe(true);
      expect(hasMinimumRole(ROLES.HOST, ROLES.USER)).toBe(true);
      expect(hasMinimumRole(ROLES.ADMIN, ROLES.HOST)).toBe(true);
      expect(hasMinimumRole(ROLES.USER, ROLES.HOST)).toBe(false);
      expect(hasMinimumRole(ROLES.HOST, ROLES.ADMIN)).toBe(false);
    });
  });

  describe("getAllowedActions()", () => {
    it("admin has all listing actions", () => {
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
        expect(actions).toContain(a);
      });
    });

    it("user has only listing.read + viewDrafts", () => {
      const actions = getAllowedActions(ROLES.USER, "listing");
      expect(actions).toContain("read");
      expect(actions).not.toContain("create");
      expect(actions).not.toContain("feature");
    });

    it("unknown resource returns []", () => {
      expect(getAllowedActions(ROLES.ADMIN, "ghost")).toEqual([]);
    });
  });
});
