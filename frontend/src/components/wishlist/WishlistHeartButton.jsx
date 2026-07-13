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
  style,
}) {
  const { isAuthenticated } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { data: status } = useWishlistStatus(listingId, {
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

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        aria-label={isSaved ? "Manage wishlist" : "Save to wishlist"}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
          flexShrink: 0,
          ...style,
        }}
      >
        <Heart
          size={iconSize}
          fill={isSaved ? "#ff5a5f" : "none"}
          stroke={isSaved ? "#ff5a5f" : "#3d3630"}
          strokeWidth={2}
        />
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
