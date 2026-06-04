const userService = require("../services/user.service.js");

// ─── GET /signup ──────────────────────────────────────────────────────────────

const renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// ─── POST /signup ─────────────────────────────────────────────────────────────

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const registeredUser = await userService.registerUser(
      username,
      email,
      password,
    );

    // Passport's req.login establishes the session — must stay in controller
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      return res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/signup");
  }
};

// ─── GET /login ───────────────────────────────────────────────────────────────

const renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// ─── POST /login  (called AFTER passport.authenticate succeeds) ───────────────

const login = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  return res.redirect(redirectUrl);
};

// ─── GET /logout ──────────────────────────────────────────────────────────────

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    return res.redirect("/listings");
  });
};

module.exports = {
  renderSignupForm,
  signup,
  renderLoginForm,
  login,
  logout,
};
