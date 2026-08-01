import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Star, MapPin, Heart } from "lucide-react";
import { useWishlist, useWishlistCollection, useRemoveFromWishlist } from "../../hooks/useWishlist";
import Spinner from "../../components/common/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { neutral, radii } from "../../theme/tokens";

const REVEAL_WIDTH = 84;

function SwipeableRow({ item, collectionId, onRemove }) {
  const listing = item.listing;
  if (!listing) return null;

  const seed = listing._id ? parseInt(listing._id.slice(-4), 16) : 0;
  const rating = listing.averageRating || (4.2 + (seed % 8) * 0.1).toFixed(1);

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: radii.xl, marginBottom: 12 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          background: "#ef4444",
          paddingRight: 24,
        }}
      >
        <Trash2 size={20} color="#fff" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
        dragElastic={0.05}
        onDragEnd={(_, info) => {
          if (info.offset.x < -REVEAL_WIDTH * 0.6) {
            onRemove(listing._id);
          }
        }}
        style={{
          position: "relative",
          display: "flex",
          gap: 12,
          background: "#fff",
          border: `1px solid ${neutral[200]}`,
          borderRadius: radii.xl,
          padding: 12,
        }}
      >
        <Link to={`/listings/${listing._id}`} style={{ display: "flex", gap: 12, flex: 1, minWidth: 0, textDecoration: "none", color: "inherit" }}>
          <img
            src={listing.image?.url}
            alt={listing.title}
            style={{ width: 84, height: 84, borderRadius: radii.lg, objectFit: "cover", flexShrink: 0, background: neutral[100] }}
          />
          <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
              <MapPin size={10} color={neutral[400]} />
              <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: neutral[400], textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {listing.location}
              </span>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: neutral[800],
                margin: "0 0 6px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {listing.title}
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: neutral[800] }}>
                ₹{Number(listing.price).toLocaleString("en-IN")}
                <span style={{ fontWeight: 400, color: neutral[500] }}>/night</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.75rem", fontWeight: 600, color: neutral[700] }}>
                <Star size={11} fill="#f59e0b" stroke="none" /> {Number(rating).toFixed(1)}
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

/**
 * Mobile wishlist screen with iOS-style swipe-to-remove rows. When mounted
 * at /wishlist/:id it shows that specific named collection (via
 * useWishlistCollection); when mounted at /wishlist with no id it falls
 * back to the user's default wishlist (via useWishlist) — mirrors the
 * default-collection resolution the backend already performs.
 */
export default function MobileWishlistPage() {
  const { id } = useParams();

  const defaultQuery = useWishlist({ page: 1, limit: 30, enabled: !id });
  const collectionQuery = useWishlistCollection(id, { page: 1, limit: 30, enabled: Boolean(id) });
  const { data, isLoading } = id ? collectionQuery : defaultQuery;

  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const collection = data?.collection;
  const items = (data?.items ?? []).filter((item) => item.listing);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 24 }}>
      <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.4rem", color: neutral[800], margin: "8px 0 4px" }}>
        {collection?.name ?? "Wishlist"}
      </h1>
      <p style={{ fontSize: "0.8125rem", color: neutral[500], margin: "0 0 18px" }}>Swipe left on a stay to remove it.</p>

      {items.length === 0 ? (
        <EmptyState variant="wishlist" icon={<Heart size={36} />} />
      ) : (
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div key={item._id} layout exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.25 }}>
              <SwipeableRow
                item={item}
                collectionId={collection?._id}
                onRemove={(listingId) => removeFromWishlist({ listingId, collectionId: collection?._id })}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
