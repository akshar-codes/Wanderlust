const userService = require("../services/user.service");
const { sendSuccess } = require("../utils/apiResponse");

// ── GET /signup ───────────────────────────────────────────────────────────────

const renderSignupForm = (_req, res) => res.render("users/signup.ejs");

// ── POST /signup ──────────────────────────────────────────────────────────────

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const registeredUser = await userService.registerUser(
      username,
      email,
      password,
    );

    // Passport's req.login must stay in the controller (it touches the session)
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");

      if (req.accepts("html")) return res.redirect("/listings");
      return sendSuccess(
        res,
        { user: { username: registeredUser.username } },
        201,
      );
    });
  } catch (err) {
    // passport-local-mongoose throws a plain Error on duplicate username, etc.
    req.flash("error", err.message);
    if (req.accepts("html")) return res.redirect("/signup");
    return next(err);
  }
};

// ── GET /login ────────────────────────────────────────────────────────────────

const renderLoginForm = (_req, res) => res.render("users/login.ejs");

// ── POST /login  (called AFTER passport.authenticate succeeds) ────────────────

const login = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  const redirectUrl = res.locals.redirectUrl ?? "/listings";

  if (req.accepts("html")) return res.redirect(redirectUrl);
  return sendSuccess(res, { redirectUrl });
};

// ── GET /logout ───────────────────────────────────────────────────────────────

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    if (req.accepts("html")) return res.redirect("/listings");
    return sendSuccess(res, { loggedOut: true });
  });
};

module.exports = { renderSignupForm, signup, renderLoginForm, login, logout };
