const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/user.js");

// Wrapped in a function so it can be initialized cleanly in app.js
module.exports = function () {
  passport.use(new LocalStrategy(User.authenticate()));

  // Controls what data is stored in session
  passport.serializeUser(User.serializeUser());

  // Rebuilds req.user from session on every request
  passport.deserializeUser(User.deserializeUser());
};
