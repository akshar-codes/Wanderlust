import { http, HttpResponse } from "msw";

export const handlers = [
  // Auth API
  http.get("/api/auth/me", () => {
    return HttpResponse.json({
      _id: "user1",
      username: "testuser",
      email: "test@example.com",
      isActive: true,
    });
  }),
  http.post("/api/auth/login", () => {
    return HttpResponse.json({ success: true });
  }),
  http.post("/api/auth/register", () => {
    return HttpResponse.json({ success: true }, { status: 201 });
  }),
  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ success: true });
  }),

  // Wishlist API
  http.get("/api/wishlist/status/:listingId", ({ params }) => {
    return HttpResponse.json({ wishlisted: false, collectionIds: [] });
  }),
  http.post("/api/wishlist/toggle", () => {
    return HttpResponse.json({ wishlisted: true, collectionId: "col1" });
  }),
  http.get("/api/wishlist/collections", () => {
    return HttpResponse.json([]);
  }),

  // Bookings API
  http.post("/api/bookings", () => {
    return HttpResponse.json(
      { success: true, booking: { _id: "booking1" } },
      { status: 201 },
    );
  }),

  http.get("/api/listings", () => {
    return HttpResponse.json({ listings: [], total: 0 });
  }),
  http.get("/api/listings/:id", () => {
    return HttpResponse.json({
      _id: "1",
      title: "Test Listing",
      price: 100,
      owner: { _id: "u1" },
    });
  }),
  http.get("/api/listings/:id/reviews", () => {
    return HttpResponse.json({ reviews: [] });
  }),
  http.post("/api/auth/forgot-password", () => {
    return HttpResponse.json({ success: true });
  }),
];
