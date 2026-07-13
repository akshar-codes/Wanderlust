import { Box, Typography } from "@mui/material";
import { Heart, FolderHeart } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, ListingCard } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { Button, IconButton } from "../ui/Button";
import { useWishlist, useRemoveFromWishlist } from "../../hooks/useWishlist";
import { neutral } from "../../theme/tokens";

const PREVIEW_LIMIT = 8;

export default function WishlistSection() {
  const { data, isLoading } = useWishlist({ page: 1, limit: PREVIEW_LIMIT });
  const {
    mutate: removeFromWishlist,
    isPending: removing,
    variables,
  } = useRemoveFromWishlist();

  const collection = data?.collection;
  const items = (data?.items ?? []).filter((item) => item.listing);

  return (
    <Card variant="raised">
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, fontSize: "1.0625rem", color: neutral[800] }}
          >
            Wishlist
          </Typography>
          <Button
            component={Link}
            to="/wishlist"
            variant="ghost"
            size="sm"
            startIcon={<FolderHeart size={15} />}
          >
            Manage all wishlists
          </Button>
        </Box>

        {isLoading ? (
          <Skeleton.Grid count={4} />
        ) : items.length === 0 ? (
          <EmptyState variant="wishlist" />
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: "24px 20px",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            }}
          >
            {items.map((item) => {
              const removingThis =
                removing && variables?.listingId === item.listing._id;
              return (
                <ListingCard
                  key={item._id}
                  listing={item.listing}
                  actions={
                    <IconButton
                      color="danger"
                      label="Remove from wishlist"
                      size="sm"
                      disabled={removingThis}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWishlist({
                          listingId: item.listing._id,
                          collectionId: collection?._id,
                        });
                      }}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(8px)",
                        "&:hover": { bgcolor: "#fee2e2" },
                      }}
                    >
                      <Heart size={15} fill="#ff5a5f" stroke="#ff5a5f" />
                    </IconButton>
                  }
                />
              );
            })}
          </Box>
        )}
      </Box>
    </Card>
  );
}
