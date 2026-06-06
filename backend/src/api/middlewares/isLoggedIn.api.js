const AppError = require("../../utils/AppError");

module.exports = (req, _res, next) => {
  if (req.isAuthenticated()) return next();
  return next(AppError.unauthorized("Authentication required"));
};
