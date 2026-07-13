import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Box, Grid, Pagination, Menu, MenuItem } from "@mui/material";
import { Share2, Edit2, Trash2, MoreHorizontal, ArrowLeft } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { Button, IconButton } from "../components/ui/Button";
import { ListingCard } from "../components/ui/Card";
import { ConfirmModal, Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import ShareCollectionModal from "../components/wishlist/ShareCollectionModal";
import {
  useWishlistCollection,
  useDeleteWishlistCollection,
  useRemoveFromWishlist,
  useUpdateWishlistCollection,
} from "../hooks/useWishlist";

const PAGE_LIMIT = 12;

function RenameModal({ open, onClose, collection }) {
  const [name, setName] = useState(collection?.name ?? "");
  const { mutate: update, isPending } = useUpdateWishlistCollection();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rename wishlist"
      maxWidth="xs"
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isPending}
            disabled={!name.trim()}
            onClick={() =>
              update(
                { id: collection._id, updates: { name: name.trim() } },
                { onSuccess: onClose },
              )
            }
          >
            Save
          </Button>
        </>
      }
    >
      <Box pt={1}>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          hint={`${name.length}/60 characters`}
          autoFocus
        />
      </Box>
    </Modal>
  );
}

export default function WishlistCollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading, isError } = useWishlistCollection(id, {
    page,
    limit: PAGE_LIMIT,
  });
  const { mutate: deleteCollection, isPending: deleting } =
    useDeleteWishlistCollection();
  const { mutate: removeItem } = useRemoveFromWishlist();

  if (isError) return <Navigate to="/wishlist" replace />;

  const collection = data?.collection;
  const items = (data?.items ?? []).filter((item) => item.listing);
  const pagination = data?.pagination;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 0, sm: 1 }, pb: 8 }}>
      <Box sx={{ mb: 1 }}>
        <Button
          variant="ghost"
          size="sm"
          startIcon={<ArrowLeft size={15} />}
          onClick={() => navigate("/wishlist")}
        >
          All wishlists
        </Button>
      </Box>

      {isLoading || !collection ? (
        <Box sx={{ mb: 3 }}>
          <Skeleton.Text lines={2} lastLineWidth="40%" />
        </Box>
      ) : (
        <PageHeader
          title={collection.name}
          subtitle={collection.description}
          actions={
            <>
              <IconButton
                color="primary"
                label="Share wishlist"
                onClick={() => setShareOpen(true)}
              >
                <Share2 size={16} />
              </IconButton>
              <IconButton
                color="primary"
                label="More options"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
              >
                <MoreHorizontal size={18} />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem
                  onClick={() => {
                    setRenameOpen(true);
                    setMenuAnchor(null);
                  }}
                >
                  <Edit2 size={14} style={{ marginRight: 8 }} /> Rename
                </MenuItem>
                {!collection.isDefault && (
                  <MenuItem
                    onClick={() => {
                      setConfirmDelete(true);
                      setMenuAnchor(null);
                    }}
                    sx={{ color: "error.main" }}
                  >
                    <Trash2 size={14} style={{ marginRight: 8 }} /> Delete
                    wishlist
                  </MenuItem>
                )}
              </Menu>
            </>
          }
        />
      )}

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }, (_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton
                variant="rounded"
                height={220}
                sx={{ borderRadius: "16px" }}
              />
            </Grid>
          ))}
        </Grid>
      ) : items.length === 0 ? (
        <EmptyState
          variant="wishlist"
          title="Nothing saved here yet"
          body="Tap the heart on any stay and choose this wishlist to save it here."
        />
      ) : (
        <>
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <ListingCard
                  listing={item.listing}
                  actions={
                    <IconButton
                      color="danger"
                      label="Remove from wishlist"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeItem({
                          listingId: item.listing._id,
                          collectionId: collection._id,
                        });
                      }}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(8px)",
                        "&:hover": { bgcolor: "#fee2e2" },
                      }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  }
                />
              </Grid>
            ))}
          </Grid>

          {pagination?.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                shape="rounded"
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {collection && (
        <>
          <RenameModal
            open={renameOpen}
            onClose={() => setRenameOpen(false)}
            collection={collection}
          />
          <ShareCollectionModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            collection={collection}
          />
          <ConfirmModal
            open={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            onConfirm={() =>
              deleteCollection(collection._id, {
                onSuccess: () => navigate("/wishlist"),
              })
            }
            loading={deleting}
            title="Delete this wishlist?"
            message="This removes the wishlist and all saved listings inside it. This cannot be undone."
            confirmLabel="Yes, delete"
            confirmVariant="danger"
          />
        </>
      )}
    </Box>
  );
}
