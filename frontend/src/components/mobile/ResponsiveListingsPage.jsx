import { useIsMobile } from "../../hooks/useIsMobile";
import ListingsPage from "../../pages/ListingsPage";
import MobileExplorePage from "../../pages/mobile/MobileExplorePage";

/**
 * Swaps in the mobile-optimized Explore experience (search sheet, filter
 * sheet, swipeable discover mode) below the mobile breakpoint, while
 * leaving the existing desktop ListingsPage completely untouched above it.
 * Both share the same useSearch hook internally, so filters/URL state stay
 * consistent regardless of which one is mounted.
 */
export default function ResponsiveListingsPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileExplorePage /> : <ListingsPage />;
}
