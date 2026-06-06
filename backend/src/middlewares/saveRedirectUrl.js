module.exports = (req, res, next) => {
  // Makes redirectUrl available to views after successful login
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};
