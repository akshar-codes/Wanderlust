"use strict";

const AppError = require("../utils/AppError");
const {
  ROLE_HIERARCHY,
  PERMISSIONS,
  can,
  hasMinimumRole,
} = require("./permissions");

// ── Internal helper: extract role safely ─────────────────────────────────────

function roleOf(req) {
  return req.user?.role ?? null;
}

// ── requireAuth ───────────────────────────────────────────────────────────────

function requireAuth() {
  return function requireAuthMiddleware(req, _res, next) {
    if (req.isAuthenticated()) return next();
    return next(AppError.unauthorized("Authentication required"));
  };
}

// ── requireRole ───────────────────────────────────────────────────────────────

requireRole("host", "admin");

function requireRole(...roles) {
  if (roles.length === 0)
    throw new Error("requireRole: at least one role required");

  // Validate that all supplied roles are known
  const unknown = roles.filter((r) => !ROLE_HIERARCHY.includes(r));
  if (unknown.length)
    throw new Error(`requireRole: unknown roles [${unknown.join(", ")}]`);

  const allowed = new Set(roles);

  return function requireRoleMiddleware(req, _res, next) {
    if (!req.isAuthenticated()) {
      return next(AppError.unauthorized("Authentication required"));
    }

    const role = roleOf(req);
    if (allowed.has(role)) return next();

    return next(
      AppError.forbidden(
        `This action requires one of the following roles: ${roles.join(", ")}`,
      ),
    );
  };
}

// ── requireMinRole ────────────────────────────────────────────────────────────

function requireMinRole(minimumRole) {
  if (!ROLE_HIERARCHY.includes(minimumRole)) {
    throw new Error(`requireMinRole: unknown role "${minimumRole}"`);
  }

  return function requireMinRoleMiddleware(req, _res, next) {
    if (!req.isAuthenticated()) {
      return next(AppError.unauthorized("Authentication required"));
    }

    const role = roleOf(req);
    if (hasMinimumRole(role, minimumRole)) return next();

    const minIdx = ROLE_HIERARCHY.indexOf(minimumRole);
    const required = ROLE_HIERARCHY.slice(minIdx).join(", ");
    return next(AppError.forbidden(`This action requires one of: ${required}`));
  };
}

// ── requirePermission ─────────────────────────────────────────────────────────

function requirePermission(resource, action) {
  const allowedSet = PERMISSIONS[resource]?.[action];
  if (!allowedSet) {
    throw new Error(
      `requirePermission: unknown permission "${resource}.${action}"`,
    );
  }

  // Empty set means the route is public (no role required but auth still checked
  // by the caller if needed).  We treat it as "always pass" here.
  const isPublic = allowedSet.size === 0;

  return function requirePermissionMiddleware(req, _res, next) {
    if (isPublic) return next();

    if (!req.isAuthenticated()) {
      return next(AppError.unauthorized("Authentication required"));
    }

    const role = roleOf(req);
    if (can(role, resource, action)) return next();

    return next(
      AppError.forbidden(
        `Your role (${role}) does not have permission to perform "${action}" on "${resource}"`,
      ),
    );
  };
}

// ── requireSelfOrAdmin ────────────────────────────────────────────────────────

function requireSelfOrAdmin(paramName = "username") {
  return function requireSelfOrAdminMiddleware(req, _res, next) {
    if (!req.isAuthenticated()) {
      return next(AppError.unauthorized("Authentication required"));
    }

    const isAdmin = req.user.role === "admin";
    const isSelf = req.user.username === req.params[paramName];

    if (isAdmin || isSelf) return next();

    return next(AppError.forbidden("You can only modify your own account"));
  };
}

// ── requireOwnerOrAdmin ───────────────────────────────────────────────────────

function requireOwnerOrAdmin(
  fetchFn,
  ownerField = "owner",
  resourceName = "Resource",
) {
  return async function requireOwnerOrAdminMiddleware(req, _res, next) {
    if (!req.isAuthenticated()) {
      return next(AppError.unauthorized("Authentication required"));
    }

    try {
      const doc = await fetchFn(req);
      if (!doc) return next(AppError.notFound(`${resourceName} not found`));

      // Attach for downstream reuse (avoids double fetch in controller)
      req.resource = doc;

      // Admin bypass
      if (req.user.role === "admin") return next();

      // Resolve nested owner field (e.g. "owner._id" or "author")
      const ownerValue = ownerField
        .split(".")
        .reduce((obj, key) => obj?.[key], doc);

      if (!ownerValue) {
        return next(AppError.forbidden(`${resourceName} has no owner`));
      }

      // Mongoose ObjectId comparison
      const ownerId =
        typeof ownerValue.equals === "function"
          ? ownerValue
          : ownerValue.toString();

      const matches =
        typeof ownerId.equals === "function"
          ? ownerId.equals(req.user._id)
          : ownerId === req.user._id.toString();

      if (matches) return next();

      return next(
        AppError.forbidden(`You do not own this ${resourceName.toLowerCase()}`),
      );
    } catch (err) {
      return next(err);
    }
  };
}

// ── requireActiveAccount ──────────────────────────────────────────────────────

function requireActiveAccount() {
  return function requireActiveAccountMiddleware(req, _res, next) {
    if (!req.isAuthenticated()) return next(); // unauthenticated requests pass through

    if (req.user.isActive !== true) {
      req.logout((err) => {
        if (err) return next(err);
        return next(
          AppError.forbidden(
            "This account has been deactivated. Please contact support.",
          ),
        );
      });
      return;
    }

    next();
  };
}

// ── Convenience combinator: requireAuthAndPermission ─────────────────────────

function requireAuthAndPermission(resource, action) {
  const authMw = requireAuth();
  const permMw = requirePermission(resource, action);

  return function requireAuthAndPermissionMiddleware(req, res, next) {
    authMw(req, res, (err) => {
      if (err) return next(err);
      permMw(req, res, next);
    });
  };
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  requireAuth,
  requireRole,
  requireMinRole,
  requirePermission,
  requireSelfOrAdmin,
  requireOwnerOrAdmin,
  requireActiveAccount,
  requireAuthAndPermission,
};
