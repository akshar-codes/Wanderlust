const User = require("../models/user.js");

const findById = (id) => User.findById(id);

const findByUsername = (username) => User.findOne({ username });

const register = (userDoc, password) => User.register(userDoc, password);

module.exports = {
  findById,
  findByUsername,
  register,
};
