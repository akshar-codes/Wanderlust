import { useIsMobile } from "../../hooks/useIsMobile";
import ListingShowPage from "../../pages/ListingShowPage";
import MobileListingDetailPage from "../../pages/mobile/MobileListingDetailPage";

/**
 * Swaps in the mobile-optimized listing detail layout (swipeable gallery,
 * sticky Reserve bar, full-screen booking flow) below the mobile breakpoint,
 * while leaving the existing desktop ListingShowPage untouched above it.
 */
export default function ResponsiveListingShowPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileListingDetailPage /> : <ListingShowPage />;
}
