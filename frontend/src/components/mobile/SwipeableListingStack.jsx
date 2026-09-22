import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Heart, X, Star, MapPin, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/auth.store";
import { useToggleWishlist } from "../../hooks/useWishlist";
import { brand, neutral, radii, shadows } from "../../theme/tokens";
import ListingCard from "../listings/ListingCard";

const SWIPE_THRESHOLD = 120;
const VISIBLE_STACK = 3;

function StackCard({ listing, index, isTop, onSwiped }) {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0]);

  const seed = listing._id ? parseInt(listing._id.slice(-4), 16) : index;
  const rating = listing.averageRating || (4.2 + (seed % 8) * 0.1).toFixed(1);

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: VISIBLE_STACK - index,
      }}
      initial={{ scale: 1 - index * 0.04, y: index * 10, opacity: index < VISIBLE_STACK ? 1 : 0 }}
      animate={{ scale: 1 - index * 0.04, y: index * 10, opacity: index < VISIBLE_STACK ? 1 : 0 }}
      exit={{ x: x.get() > 0 ? 400 : -400, opacity: 0, transition: { duration: 0.3 } }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) onSwiped("right", listing);
        else if (info.offset.x < -SWIPE_THRESHOLD) onSwiped("left", listing);
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div
        onClick={() => isTop && Math.abs(x.get()) < 4 && navigate(`/listings/${listing._id}`)}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: radii["2xl"],
          overflow: "hidden",
          boxShadow: shadows.xl,
          background: "var(--color-surface)",
          cursor: isTop ? "grab" : "default",
          padding: 8, // Give some breathing room for the card
        }}
      >
        <ListingCard listing={listing} index={0} noLink />

        {isTop && (
          <>
            <motion.div
              style={{
                opacity: likeOpacity,
                position: "absolute",
                top: 28,
                left: 24,
                border: "3px solid #22c55e",
                color: "#22c55e",
                borderRadius: 10,
                padding: "4px 14px",
                fontWeight: 800,
                fontSize: "1.4rem",
                transform: "rotate(-14deg)",
                textTransform: "uppercase",
                pointerEvents: "none",
              }}
            >
              Save
            </motion.div>
            <motion.div
              style={{
                opacity: nopeOpacity,
                position: "absolute",
                top: 28,
                right: 24,
                border: "3px solid #ef4444",
                color: "#ef4444",
                borderRadius: 10,
                padding: "4px 14px",
                fontWeight: 800,
                fontSize: "1.4rem",
                transform: "rotate(14deg)",
                textTransform: "uppercase",
                pointerEvents: "none",
              }}
            >
              Pass
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Tinder-style swipeable card stack for browsing listings. Swipe right (or
 * tap the heart button) saves to the user's default wishlist via the real
 * useToggleWishlist mutation; swipe left / X just advances the stack —
 * there is no "skip" concept on the backend, this is purely a browsing UI.
 */
export default function SwipeableListingStack({ listings = [] }) {
  const { isAuthenticated } = useAuthStore();
  const { mutate: toggleWishlist } = useToggleWishlist();
  const [cursor, setCursor] = useState(0);

  const remaining = useMemo(() => listings.slice(cursor), [listings, cursor]);

  const handleSwiped = useCallback(
    (direction, listing) => {
      if (direction === "right") {
        if (!isAuthenticated) {
          toast.error("Log in to save listings to your wishlist");
        } else {
          toggleWishlist({ listingId: listing._id });
        }
      }
      setCursor((c) => c + 1);
    },
    [isAuthenticated, toggleWishlist],
  );

  if (listings.length === 0) return null;

  if (remaining.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 460,
          gap: 14,
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ fontSize: "2.5rem" }}>🎉</div>
        <p style={{ fontWeight: 700, color: neutral[800], margin: 0 }}>You've seen them all</p>
        <p style={{ fontSize: "0.875rem", color: neutral[500], margin: 0 }}>Check back later for more stays.</p>
        <button
          onClick={() => setCursor(0)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            borderRadius: 999,
            border: `1.5px solid ${neutral[300]}`,
            background: "#fff",
            fontWeight: 600,
            fontSize: "0.875rem",
            color: neutral[700],
            cursor: "pointer",
          }}
        >
          <RotateCcw size={14} /> Start over
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 380, height: 520 }}>
        <AnimatePresence>
          {remaining.slice(0, VISIBLE_STACK).map((listing, i) => (
            <StackCard key={listing._id} listing={listing} index={i} isTop={i === 0} onSwiped={handleSwiped} />
          ))}
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setCursor((c) => c + 1)}
          aria-label="Pass"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: `1.5px solid ${neutral[200]}`,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: shadows.md,
          }}
        >
          <X size={24} color="#ef4444" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            const listing = remaining[0];
            if (!isAuthenticated) {
              toast.error("Log in to save listings to your wishlist");
            } else {
              toggleWishlist({ listingId: listing._id });
            }
            setCursor((c) => c + 1);
          }}
          aria-label="Save"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: `linear-gradient(135deg, ${brand[500]}, ${brand[600]})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: shadows.brand,
          }}
        >
          <Heart size={24} color="#fff" fill="#fff" />
        </motion.button>
      </div>
    </div>
  );
}
