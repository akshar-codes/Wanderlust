import AppError from "../utils/AppError.js";
import { requireVerifiedEmail } from "./requireVerifiedEmail.js";
import {
  ROLE_HIERARCHY,
  PERMISSIONS,
  can,
  hasMinimumRole,
} from "./permissions.js";

// ── Internal helper ───────────────────────────────────────────────────────────

function roleOf(req) {
  return req.user?.role ?? null;
}

// ── requireAuth ───────────────────────────────────────────────────────────────

export function requireAuth() {
  return function requireAuthMiddleware(req, _res, next) {
    if (req.isAuthenticated()) return next();
    return next(AppError.unauthorized("Authentication required"));
  };
}

// ── requireRole ───────────────────────────────────────────────────────────────

export function requireRole(...roles) {
  if (roles.length === 0)
    throw new Error("requireRole: at least one role required");

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

export function requireMinRole(minimumRole) {
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

export function requirePermission(resource, action) {
  const allowedSet = PERMISSIONS[resource]?.[action];
  if (!allowedSet) {
    throw new Error(
      `requirePermission: unknown permission "${resource}.${action}"`,
    );
  }

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

export function requireSelfOrAdmin(paramName = "username") {
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

export function requireOwnerOrAdmin(
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

      req.resource = doc;

      if (req.user.role === "admin") return next();

      const ownerValue = ownerField
        .split(".")
        .reduce((obj, key) => obj?.[key], doc);

      if (!ownerValue) {
        return next(AppError.forbidden(`${resourceName} has no owner`));
      }

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

export function requireActiveAccount() {
  return function requireActiveAccountMiddleware(req, _res, next) {
    if (!req.isAuthenticated()) return next();

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

// ── requireAuthAndPermission ──────────────────────────────────────────────────

export function requireAuthAndPermission(resource, action) {
  const authMw = requireAuth();
  const permMw = requirePermission(resource, action);

  return function requireAuthAndPermissionMiddleware(req, res, next) {
    authMw(req, res, (err) => {
      if (err) return next(err);
      permMw(req, res, next);
    });
  };
}

// Re-export requireVerifiedEmail so rbac is a single import point for routes
export { requireVerifiedEmail };
