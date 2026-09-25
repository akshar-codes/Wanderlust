import { useState } from "react";
import {
  Popover,
  Box,
  Typography,
  Checkbox,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Plus, Heart } from "lucide-react";
import {
  useWishlistCollections,
  useWishlistStatus,
  useToggleWishlist,
  useCreateWishlistCollection,
} from "../../hooks/useWishlist";
import { radii } from "../../theme/tokens";

/**
 * Popover listing every one of the current user's wishlists with a
 * checkbox — clicking a row toggles the listing in/out of that specific
 * wishlist. Mirrors Airbnb's "Save to..." panel rather than a single
 * implicit save target, since users may have several named wishlists.
 */
export default function CollectionPickerMenu({
  anchorEl,
  open,
  onClose,
  listingId,
}) {
  const { data: collections = [], isLoading: collectionsLoading } =
    useWishlistCollections({ enabled: open });
  const { data: status } = useWishlistStatus(listingId, { enabled: open });
  const { mutate: toggle, isPending: toggling } = useToggleWishlist();
  const { mutate: createCollection, isPending: creating } =
    useCreateWishlistCollection();

  const [newName, setNewName] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);

  const savedIds = new Set(status?.collectionIds ?? []);

  const handleToggle = (collectionId) => {
    toggle({ listingId, collectionId });
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCollection(
      { name: newName.trim() },
      {
        onSuccess: (collection) => {
          setNewName("");
          setCreatingNew(false);
          toggle({ listingId, collectionId: collection._id });
        },
      },
    );
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      onClick={(e) => e.stopPropagation()}
      slotProps={{
        paper: { sx: { borderRadius: radii.xl, width: 300, mt: 1 } },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.9375rem",
            color: "text.primary",
            mb: 1.5,
          }}
        >
          Save to wishlist
        </Typography>

        {collectionsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={20} sx={{ color: "primary.main" }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            {collections.map((c) => (
              <Box
                component="button"
                type="button"
                key={c._id}
                onClick={() => !toggling && handleToggle(c._id)}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.75,
                  px: 0.5,
                  borderRadius: radii.md,
                  cursor: toggling ? "not-allowed" : "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Checkbox
                  checked={savedIds.has(c._id)}
                  disabled={toggling}
                  size="small"
                  sx={{
                    color: "action.active",
                    "&.Mui-checked": { color: "primary.main" },
                  }}
                />
                {c.coverImage ? (
                  <Box
                    component="img"
                    src={c.coverImage}
                    alt=""
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: radii.sm,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: radii.sm,
                      bgcolor: "action.hover",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Heart size={14} color="var(--color-text-muted)" />
                  </Box>
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "text.primary",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "var(--color-text-muted)" }}
                  >
                    {c.itemCount ?? 0} saved
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ height: 1, bgcolor: "divider", my: 1.5 }} />

        {creatingNew ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              autoFocus
              size="small"
              placeholder="New wishlist name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              fullWidth
              inputProps={{ maxLength: 60 }}
            />
            <Box
              component="button"
              type="button"
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              sx={{
                px: 1.5,
                border: "none",
                borderRadius: radii.md,
                bgcolor: "primary.main",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.8125rem",
                cursor: "pointer",
                opacity: !newName.trim() ? 0.5 : 1,
                fontFamily: "inherit",
              }}
            >
              Add
            </Box>
          </Box>
        ) : (
          <Box
            component="button"
            type="button"
            onClick={() => setCreatingNew(true)}
            sx={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "none",
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 0.75,
              px: 0.5,
              borderRadius: radii.md,
              cursor: "pointer",
              color: "primary.main",
              fontWeight: 700,
              fontSize: "0.8125rem",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: radii.sm,
                border: `1.5px dashed var(--color-border)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={14} color="var(--color-text-muted)" />
            </Box>
            Create new wishlist
          </Box>
        )}
      </Box>
    </Popover>
  );
}
