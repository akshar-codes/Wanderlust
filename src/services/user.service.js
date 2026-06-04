const userRepo = require("../repositories/user.repository.js");
const User = require("../models/user.js");

// ─── Registration ─────────────────────────────────────────────────────────────

const registerUser = async (username, email, password) => {
  const user = new User({ username, email });
  const registeredUser = await userRepo.register(user, password);
  return registeredUser;
};

module.exports = {
  registerUser,
};
