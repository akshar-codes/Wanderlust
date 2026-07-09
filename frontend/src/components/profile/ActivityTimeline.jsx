import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import {
  Home,
  MessageSquare,
  Heart,
  CalendarCheck,
  UserPlus,
} from "lucide-react";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { neutral, brand, radii } from "../../theme/tokens";

const MAX_EVENTS = 15;

const EVENT_META = {
  joined: { icon: UserPlus, color: brand[500] },
  listing: { icon: Home, color: "#0d9488" },
  reviewReceived: { icon: MessageSquare, color: "#f59e0b" },
  reviewWritten: { icon: MessageSquare, color: brand[500] },
  wishlist: { icon: Heart, color: "#ef4444" },
  booking: { icon: CalendarCheck, color: "#3b82f6" },
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Builds a unified, chronologically-sorted activity feed out of data the
 * profile page already fetches for its other sections — no extra API calls.
 */
function buildEvents({
  joinedAt,
  displayName,
  listings = [],
  reviewsReceived = [],
  isSelf,
  wishlistItems = [],
  myReviews = [],
  myBookings = [],
}) {
  const events = [];

  if (joinedAt) {
    events.push({
      key: "joined",
      type: "joined",
      date: joinedAt,
      title: `${displayName} joined Wanderlust`,
    });
  }

  listings.forEach((l) => {
    events.push({
      key: `listing-${l._id}`,
      type: "listing",
      date: l.createdAt,
      title: l.draft ? `Saved a draft: “${l.title}”` : `Published “${l.title}”`,
      to: `/listings/${l._id}`,
    });
  });

  reviewsReceived.forEach((r) => {
    events.push({
      key: `review-received-${r._id}`,
      type: "reviewReceived",
      date: r.createdAt,
      title: `Received a ${r.rating}★ review${r.listing ? ` on “${r.listing.title}”` : ""}`,
      to: r.listing ? `/listings/${r.listing._id}` : undefined,
    });
  });

  if (isSelf) {
    wishlistItems.forEach((w) => {
      if (!w.listing) return;
      events.push({
        key: `wishlist-${w._id}`,
        type: "wishlist",
        date: w.createdAt,
        title: `Saved “${w.listing.title}” to wishlist`,
        to: `/listings/${w.listing._id}`,
      });
    });

    myReviews.forEach((r) => {
      events.push({
        key: `review-written-${r._id}`,
        type: "reviewWritten",
        date: r.createdAt,
        title: `Wrote a ${r.rating}★ review${r.listing ? ` for “${r.listing.title}”` : ""}`,
        to: r.listing ? `/listings/${r.listing._id}` : undefined,
      });
    });

    myBookings.forEach((b) => {
      events.push({
        key: `booking-${b._id}`,
        type: "booking",
        date: b.createdAt,
        title: `Booked “${b.listing?.title ?? "a stay"}”`,
        to: b.listing ? `/listings/${b.listing._id}` : undefined,
      });
    });
  }

  return events
    .filter((e) => e.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, MAX_EVENTS);
}

export default function ActivityTimeline(props) {
  const events = useMemo(() => buildEvents(props), [props]);

  return (
    <Card variant="raised">
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1.0625rem",
            color: neutral[800],
            mb: 2.5,
          }}
        >
          Activity
        </Typography>

        {events.length === 0 ? (
          <EmptyState
            variant="generic"
            compact
            body="No activity to show yet."
          />
        ) : (
          <Box sx={{ position: "relative", pl: 3 }}>
            <Box
              sx={{
                position: "absolute",
                left: 7,
                top: 6,
                bottom: 6,
                width: 2,
                bgcolor: neutral[100],
              }}
            />
            {events.map((event) => {
              const meta = EVENT_META[event.type] ?? EVENT_META.listing;
              const Icon = meta.icon;
              return (
                <Box
                  key={event.key}
                  sx={{
                    position: "relative",
                    pb: 2.5,
                    "&:last-child": { pb: 0 },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      left: -24,
                      top: 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor: "#fff",
                      border: `2px solid ${meta.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={9} color={meta.color} />
                  </Box>
                  <Typography
                    component={event.to ? "a" : "p"}
                    href={event.to}
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: neutral[700],
                      textDecoration: "none",
                      "&:hover": event.to ? { color: brand[600] } : undefined,
                    }}
                  >
                    {event.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: neutral[400] }}>
                    {formatDate(event.date)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Card>
  );
}
