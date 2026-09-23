import mongoose from "mongoose";
import User from "../../src/models/user.js";
import Listing from "../../src/models/listing.js";
import Booking from "../../src/models/booking.js";
import Review from "../../src/models/review.js";
import WishlistCollection from "../../src/models/wishlistCollection.js";

export async function makeUser(overrides = {}) {
  const seed = Date.now() + Math.floor(Math.random() * 100000);
  const user = new User({
    username: `user_${seed}`,
    email: `user_${seed}@example.com`,
    isActive: true,
    emailVerified: true,
    ...overrides,
  });
  if (overrides.password) {
    await User.register(user, overrides.password);
  } else {
    // If not specifying password, just save directly to bypass passport-local-mongoose checks
    // for tests where password doesn't matter (or register with a default)
    await User.register(user, "Password123!");
  }
  return user;
}

export async function makeListing(ownerId, overrides = {}) {
  const seed = Date.now() + Math.floor(Math.random() * 100000);
  return Listing.create({
    owner: ownerId,
    title: `Listing ${seed}`,
    slug: `listing-${seed}`,
    description: "A lovely place to stay",
    location: "Test City, Country",
    country: "Test Country",
    category: "rooms",
    price: 100,
    pricing: { nightlyPrice: 100, cleaningFee: 20, serviceFee: 10 },
    geometry: { type: "Point", coordinates: [0, 0] },
    status: "active",
    draft: false,
    ...overrides,
  });
}

export async function makeBooking(guestId, listingId, hostId, overrides = {}) {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 5);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 3);

  return Booking.create({
    guest: guestId,
    listing: listingId,
    host: hostId,
    checkIn,
    checkOut,
    nights: 3,
    guestsCount: 2,
    pricing: {
      nightlyPrice: 100,
      cleaningFee: 20,
      serviceFee: 10,
      taxes: 23,
      subtotal: 300,
      total: 353,
    },
    status: "pending",
    blockedDateId: new mongoose.Types.ObjectId(),
    ...overrides,
  });
}

export async function makeReview(authorId, listingId, overrides = {}) {
  return Review.create({
    author: authorId,
    listing: listingId,
    rating: 5,
    text: "Great stay!",
    ...overrides,
  });
}

export async function makeCollection(ownerId, overrides = {}) {
  const seed = Date.now() + Math.floor(Math.random() * 100000);
  return WishlistCollection.create({
    owner: ownerId,
    name: `Collection ${seed}`,
    itemCount: 0,
    ...overrides,
  });
}
