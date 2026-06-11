"use strict";

// ── Role constants ─────────────────────────────────────────────────────────────

const ROLES = Object.freeze({
  USER: "user",
  HOST: "host",
  ADMIN: "admin",
});

/** Ordered array for hierarchy comparisons (index = privilege level). */
const ROLE_HIERARCHY = [ROLES.USER, ROLES.HOST, ROLES.ADMIN];

// ── Permission definitions ────────────────────────────────────────────────────

const _raw = {
  // ── Listings ──────────────────────────────────────────────────────────────
  listing: {
    read: [ROLES.USER, ROLES.HOST, ROLES.ADMIN], // GET  /listings, /listings/:id
    create: [ROLES.HOST, ROLES.ADMIN], // POST /listings
    update: [ROLES.HOST, ROLES.ADMIN], // PUT/PATCH /listings/:id  (ownership enforced separately)
    delete: [ROLES.HOST, ROLES.ADMIN], // DELETE /listings/:id
    publish: [ROLES.HOST, ROLES.ADMIN], // POST /listings/:id/publish
    unpublish: [ROLES.HOST, ROLES.ADMIN], // POST /listings/:id/unpublish
    feature: [ROLES.ADMIN], // PATCH /listings/:id/featured
    manageImages: [ROLES.HOST, ROLES.ADMIN], // POST/DELETE/PATCH /listings/:id/images
    manageAvailability: [ROLES.HOST, ROLES.ADMIN], // POST/DELETE /listings/:id/availability
    viewDrafts: [ROLES.HOST, ROLES.ADMIN], // GET with includeNonPublic=true
    viewAnyDraft: [ROLES.ADMIN], // admin can view any draft, host only own
  },

  // ── Reviews ────────────────────────────────────────────────────────────────
  review: {
    read: [ROLES.USER, ROLES.HOST, ROLES.ADMIN], // GET  /reviews
    create: [ROLES.USER, ROLES.HOST, ROLES.ADMIN], // POST /reviews
    update: [ROLES.USER, ROLES.HOST, ROLES.ADMIN], // PATCH /reviews/:id (authorship enforced separately)
    delete: [ROLES.USER, ROLES.HOST, ROLES.ADMIN], // DELETE /reviews/:id
    deleteAny: [ROLES.ADMIN], // admin can delete any review
    moderate: [ROLES.ADMIN], // admin-only moderation actions
  },

  // ── Users ──────────────────────────────────────────────────────────────────
  user: {
    readPublic: [ROLES.USER, ROLES.HOST, ROLES.ADMIN], // GET /users/:username (public shape)
    readOwn: [ROLES.USER, ROLES.HOST, ROLES.ADMIN], // GET /users/:username (full shape, self only)
    updateOwn: [ROLES.USER, ROLES.HOST, ROLES.ADMIN], // PATCH /users/:username/profile
    updateAny: [ROLES.ADMIN], // admin can update any user
    changeRole: [ROLES.ADMIN], // PATCH /users/:username/role
    deleteOwn: [ROLES.USER, ROLES.HOST, ROLES.ADMIN], // DELETE /users/:username (self)
    deleteAny: [ROLES.ADMIN], // admin can delete anyone
    listAll: [ROLES.ADMIN], // GET /users (admin only)
    viewPrivate: [ROLES.ADMIN], // view private profile fields
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  auth: {
    signup: [], // empty = public (no role required)
    login: [],
    logout: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
    viewSession: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
  },

  // ── Admin panel ────────────────────────────────────────────────────────────
  admin: {
    access: [ROLES.ADMIN],
    viewStats: [ROLES.ADMIN],
    manageUsers: [ROLES.ADMIN],
    manageListings: [ROLES.ADMIN],
    viewLogs: [ROLES.ADMIN],
  },
};

// ── Convert arrays → frozen Sets ─────────────────────────────────────────────

const PERMISSIONS = Object.fromEntries(
  Object.entries(_raw).map(([resource, actions]) => [
    resource,
    Object.fromEntries(
      Object.entries(actions).map(([action, roles]) => [
        action,
        Object.freeze(new Set(roles)),
      ]),
    ),
  ]),
);
Object.freeze(PERMISSIONS);

// ── Helpers ───────────────────────────────────────────────────────────────────

function can(role, resource, action) {
  return PERMISSIONS[resource]?.[action]?.has(role) ?? false;
}

function hasMinimumRole(role, minimumRole) {
  return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(minimumRole);
}

function getAllowedActions(role, resource) {
  const actions = PERMISSIONS[resource];
  if (!actions) return [];
  return Object.entries(actions)
    .filter(([, set]) => set.has(role))
    .map(([action]) => action);
}

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  can,
  hasMinimumRole,
  getAllowedActions,
};
