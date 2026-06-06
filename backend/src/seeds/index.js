const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const initData = require("./data.js");
const reviewData = require("./reviews.js");
const { cloudinary } = require("../config/cloudConfig.js");

const MONGO_URL = process.env.MONGO_URL;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!MONGO_URL) throw new Error("MONGO_URL is undefined");
if (!ADMIN_PASS) throw new Error("ADMIN_PASS is undefined");
if (!process.env.CLOUD_NAME) throw new Error("CLOUD_NAME is undefined");

// Connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("✅ MongoDB connected");
}

// Delete old Cloudinary folder to avoid duplicates
async function clearCloudinary() {
  try {
    await cloudinary.api.delete_resources_by_prefix("wanderlust_DEV");
    await cloudinary.api.delete_folder("wanderlust_DEV");
    console.log("✅ Old Cloudinary folder deleted");
  } catch (err) {
    console.error("❌ Failed to delete Cloudinary folder:", err);
  }
}

// Initialize database with listings, reviews, and admin user
async function initDB() {
  await Listing.deleteMany({});
  await Review.deleteMany({});
  await User.deleteMany({});
  console.log("✅ Old database entries deleted");

  // Create admin user
  const adminUser = new User({
    username: "AdminUser",
    email: "admin.user@wanderlust.com",
    role: "admin",
  });
  const registeredAdmin = await User.register(adminUser, ADMIN_PASS);
  console.log("✅ Admin user created:", registeredAdmin.username);

  for (let listingData of initData.data) {
    const newListing = new Listing(listingData);
    newListing.owner = registeredAdmin._id;

    // Upload image to Cloudinary if exists
    if (listingData.imagePath && fs.existsSync(listingData.imagePath)) {
      const result = await cloudinary.uploader.upload(listingData.imagePath, {
        folder: "wanderlust_DEV",
      });
      newListing.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // Randomly assign up to 4 reviews to each listing
    const shuffledReviews = [...reviewData.data].sort(
      () => 0.5 - Math.random()
    );
    const selectedReviews = shuffledReviews.slice(0, 4);

    for (let reviewDatum of selectedReviews) {
      const review = new Review({
        ...reviewDatum,
        author: registeredAdmin._id,
        createdAt: new Date(),
      });
      await review.save();
      newListing.reviews.push(review);
    }

    await newListing.save();
  }

  console.log("✅ Listings and reviews seeded successfully");
}

async function run() {
  await main();
  await clearCloudinary();
  await initDB();
  process.exit(0);
}

run();
