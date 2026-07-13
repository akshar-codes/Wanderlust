import { useParams } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import { Heart, Compass } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { ListingCard } from "../components/ui/Card";
import { useSharedWishlist } from "../hooks/useWishlist";
import { neutral, brand, fonts } from "../theme/tokens";

export default function SharedWishlistPage() {
  const { token } = useParams();
  const { data, isLoading, isError } = useSharedWishlist(token);

  const collection = data?.collection;
  const items = (data?.items ?? []).filter((item) => item.listing);

  return (
    <Box
      sx={{ maxWidth: 1100, mx: "auto", px: { xs: 0, sm: 1 }, pb: 8, pt: 4 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <Compass size={20} color={brand[500]} />
        <Typography
          variant="caption"
          sx={{ color: neutral[500], fontWeight: 600 }}
        >
          Shared Wanderlust wishlist
        </Typography>
      </Box>

      {isLoading ? (
        <Skeleton.Text lines={2} lastLineWidth="30%" />
      ) : isError || !collection ? (
        <EmptyState
          variant="error"
          icon={<Heart size={36} />}
          title="This link is no longer available"
          body="The wishlist may have been made private or deleted by its owner."
        />
      ) : (
        <>
          <Typography
            sx={{
              fontFamily: fonts.display,
              fontSize: "2rem",
              color: neutral[800],
              mb: 0.5,
            }}
          >
            {collection.name}
          </Typography>
          {collection.description && (
            <Typography
              variant="body2"
              sx={{ color: neutral[500], mb: 3, maxWidth: 560 }}
            >
              {collection.description}
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{ color: neutral[400], display: "block", mb: 3 }}
          >
            {collection.itemCount ?? 0}{" "}
            {collection.itemCount === 1 ? "saved stay" : "saved stays"}
          </Typography>

          {items.length === 0 ? (
            <EmptyState
              variant="wishlist"
              title="No stays saved yet"
              body="Check back later."
            />
          ) : (
            <Grid container spacing={3}>
              {items.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item._id}>
                  <ListingCard listing={item.listing} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}
