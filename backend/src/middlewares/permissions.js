// ── Role constants ─────────────────────────────────────────────────────────────

export const ROLES = Object.freeze({
  USER: "user",
  HOST: "host",
  ADMIN: "admin",
});

export const ROLE_HIERARCHY = [ROLES.USER, ROLES.HOST, ROLES.ADMIN];

// ── Permission definitions ────────────────────────────────────────────────────

const _raw = {
  listing: {
    read: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
    create: [ROLES.HOST, ROLES.ADMIN],
    update: [ROLES.HOST, ROLES.ADMIN],
    delete: [ROLES.HOST, ROLES.ADMIN],
    publish: [ROLES.HOST, ROLES.ADMIN],
    unpublish: [ROLES.HOST, ROLES.ADMIN],
    feature: [ROLES.ADMIN],
    manageImages: [ROLES.HOST, ROLES.ADMIN],
    manageAvailability: [ROLES.HOST, ROLES.ADMIN],
    viewDrafts: [ROLES.HOST, ROLES.ADMIN],
    viewAnyDraft: [ROLES.ADMIN],
  },
  review: {
    read: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
    create: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
    update: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
    delete: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
    deleteAny: [ROLES.ADMIN],
    moderate: [ROLES.ADMIN],
  },
  user: {
    readPublic: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
    readOwn: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
    updateOwn: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
    updateAny: [ROLES.ADMIN],
    changeRole: [ROLES.ADMIN],
    deleteOwn: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
    deleteAny: [ROLES.ADMIN],
    listAll: [ROLES.ADMIN],
    viewPrivate: [ROLES.ADMIN],
  },
  auth: {
    signup: [],
    login: [],
    logout: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
    viewSession: [ROLES.USER, ROLES.HOST, ROLES.ADMIN],
  },
  admin: {
    access: [ROLES.ADMIN],
    viewStats: [ROLES.ADMIN],
    manageUsers: [ROLES.ADMIN],
    manageListings: [ROLES.ADMIN],
    viewLogs: [ROLES.ADMIN],
  },
};

// ── Convert arrays → frozen Sets ─────────────────────────────────────────────

export const PERMISSIONS = Object.fromEntries(
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

export function can(role, resource, action) {
  return PERMISSIONS[resource]?.[action]?.has(role) ?? false;
}

export function hasMinimumRole(role, minimumRole) {
  return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(minimumRole);
}

export function getAllowedActions(role, resource) {
  const actions = PERMISSIONS[resource];
  if (!actions) return [];
  return Object.entries(actions)
    .filter(([, set]) => set.has(role))
    .map(([action]) => action);
}
