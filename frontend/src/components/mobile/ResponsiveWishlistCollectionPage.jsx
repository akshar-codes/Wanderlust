import { useIsMobile } from "../../hooks/useIsMobile";
import WishlistCollectionPage from "../../pages/WishlistCollectionPage";
import MobileWishlistPage from "../../pages/mobile/MobileWishlistPage";

/**
 * Swaps in the mobile swipe-to-remove wishlist layout below the mobile
 * breakpoint, while leaving the existing desktop WishlistCollectionPage
 * (rename/share/delete menu, grid layout) untouched above it. Both read the
 * same `:id` route param — when absent, both fall back to the user's
 * default wishlist collection.
 */
export default function ResponsiveWishlistCollectionPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileWishlistPage /> : <WishlistCollectionPage />;
}
