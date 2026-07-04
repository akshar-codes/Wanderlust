import { useState } from "react";
import { Box, Typography, Pagination } from "@mui/material";
import { Heart } from "lucide-react";

import { Card, ListingCard } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { IconButton } from "../ui/Button";
import { useWishlist, useRemoveFromWishlist } from "../../hooks/useWishlist";
import { neutral } from "../../theme/tokens";

const PAGE_LIMIT = 12;

export default function WishlistSection() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWishlist({ page, limit: PAGE_LIMIT });
  const {
    mutate: removeFromWishlist,
    isPending: removing,
    variables,
  } = useRemoveFromWishlist();

  const items = (data?.items ?? []).filter((item) => item.listing);
  const pagination = data?.pagination;

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
          Wishlist
        </Typography>

        {isLoading ? (
          <Skeleton.Grid count={6} />
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
              const removingThis = removing && variables === item.listing._id;
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
                        removeFromWishlist(item.listing._id);
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

        {pagination?.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              shape="rounded"
              color="primary"
            />
          </Box>
        )}
      </Box>
    </Card>
  );
}
