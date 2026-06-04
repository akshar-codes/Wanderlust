const Listing = require("../models/listing.js");

const findAll = (filter = {}) => Listing.find(filter);

const findByIdWithDetails = (id) =>
  Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

const findById = (id) => Listing.findById(id);

const create = (data) => Listing.create(data);

const updateById = (id, updates) =>
  Listing.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

const deleteById = (id) => Listing.findByIdAndDelete(id);

module.exports = {
  findAll,
  findByIdWithDetails,
  findById,
  create,
  updateById,
  deleteById,
};
