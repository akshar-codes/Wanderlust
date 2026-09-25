import { useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/auth.store";
import { useWishlistStatus } from "../../hooks/useWishlist";
import CollectionPickerMenu from "./CollectionPickerMenu";

export default function WishlistHeartButton({
  listingId,
  size = 34,
  iconSize = 15,
  variant = "circle", // "circle" or "pill"
  style,
}) {
  const { isAuthenticated } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { data: status, isLoading } = useWishlistStatus(listingId, {
    enabled: isAuthenticated,
  });
  const isSaved = Boolean(status?.wishlisted);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Log in to save listings to your wishlist");
      return;
    }
    setAnchorEl(e.currentTarget);
  };

  const isPill = variant === "pill";

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleClick}
        aria-label={isSaved ? "Manage wishlist" : "Save to wishlist"}
        style={{
          width: isPill ? "auto" : size,
          height: isPill ? "auto" : size,
          padding: isPill ? "8px 16px" : 0,
          borderRadius: isPill ? 999 : "50%",
          background: isPill
            ? isSaved
              ? "rgba(255,90,95,0.06)"
              : "var(--color-surface)"
            : "var(--color-surface)",
          opacity: isLoading ? 0.6 : 1,
          border: isPill
            ? `1.5px solid ${isSaved ? "rgba(255,90,95,0.4)" : "var(--color-border)"}`
            : "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: isPill ? 6 : 0,
          cursor: "pointer",
          boxShadow: isPill ? "none" : "0 2px 8px rgba(0,0,0,0.14)",
          flexShrink: 0,
          transition: "all 0.2s",
          color: isSaved ? "var(--color-primary-500)" : "var(--color-text)",
          fontSize: "0.8125rem",
          fontWeight: 600,
          fontFamily: "inherit",
          ...style,
        }}
      >
        <motion.div
          animate={{ scale: isSaved ? [1, 1.4, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart
            size={iconSize}
            fill={isSaved ? "var(--color-primary-500)" : "none"}
            stroke={isSaved ? "var(--color-primary-500)" : "currentColor"}
            strokeWidth={2}
          />
        </motion.div>
        {isPill && (isSaved ? "Saved" : "Save")}
      </motion.button>

      <CollectionPickerMenu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        listingId={listingId}
      />
    </>
  );
}
