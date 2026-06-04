const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  // Stash the original URL so the login controller can redirect back
  req.session.redirectUrl = req.originalUrl;

  // Flash for the EJS template (preserves UX for browser clients)
  req.flash("error", "You must be logged in first");

  // Redirect browser requests; return a 401 for API / non-browser clients
  const acceptsHtml = req.accepts("html");
  if (acceptsHtml) return res.redirect("/login");

  return next(AppError.unauthorized());
};
