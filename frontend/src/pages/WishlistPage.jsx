import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import { Plus } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import CollectionCard from "../components/wishlist/CollectionCard";
import CreateCollectionModal from "../components/wishlist/CreateCollectionModal";
import { useWishlistCollections } from "../hooks/useWishlist";

export default function WishlistPage() {
  const navigate = useNavigate();
  const { data: collections = [], isLoading } = useWishlistCollections();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 0, sm: 1 }, pb: 8 }}>
      <PageHeader
        eyebrow="Saved"
        title="Wishlists"
        subtitle="Organize the stays you love into collections you can revisit or share."
        actions={
          <Button
            variant="primary"
            startIcon={<Plus size={16} />}
            onClick={() => setCreateOpen(true)}
          >
            New wishlist
          </Button>
        }
      />

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 4 }, (_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton
                variant="rounded"
                height={220}
                sx={{ borderRadius: "20px" }}
              />
            </Grid>
          ))}
        </Grid>
      ) : collections.length === 0 ? (
        <EmptyState
          variant="wishlist"
          title="No wishlists yet"
          body="Save stays you love to start building your first wishlist."
        />
      ) : (
        <Grid container spacing={3}>
          {collections.map((collection) => (
            <Grid item xs={12} sm={6} md={4} key={collection._id}>
              <CollectionCard
                collection={collection}
                onClick={() => navigate(`/wishlist/${collection._id}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <CreateCollectionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(collection) => navigate(`/wishlist/${collection._id}`)}
      />
    </Box>
  );
}
