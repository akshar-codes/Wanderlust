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
import { neutral, brand, radii } from "../../theme/tokens";

/**
 * Popover listing every one of the current user's wishlists with a
 * checkbox — clicking a row toggles the listing in/out of that specific
 * wishlist. Mirrors Airbnb's "Save to..." panel rather than a single
 * implicit save target, since users may have several named wishlists.
 */
export default function CollectionPickerMenu({ anchorEl, open, onClose, listingId }) {
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
      slotProps={{ paper: { sx: { borderRadius: radii.xl, width: 300, mt: 1 } } }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          sx={{ fontWeight: 700, fontSize: "0.9375rem", color: neutral[800], mb: 1.5 }}
        >
          Save to wishlist
        </Typography>

        {collectionsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={20} sx={{ color: brand[500] }} />
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
                key={c._id}
                onClick={() => !toggling && handleToggle(c._id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.75,
                  px: 0.5,
                  borderRadius: radii.md,
                  cursor: toggling ? "not-allowed" : "pointer",
                  "&:hover": { bgcolor: neutral[50] },
                }}
              >
                <Checkbox
                  checked={savedIds.has(c._id)}
                  disabled={toggling}
                  size="small"
                  sx={{ color: neutral[300], "&.Mui-checked": { color: brand[500] } }}
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
                      bgcolor: neutral[100],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Heart size={14} color={neutral[400]} />
                  </Box>
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: neutral[800],
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: neutral[400] }}>
                    {c.itemCount ?? 0} saved
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ height: 1, bgcolor: neutral[100], my: 1.5 }} />

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
                bgcolor: brand[500],
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
            onClick={() => setCreatingNew(true)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 0.75,
              px: 0.5,
              borderRadius: radii.md,
              cursor: "pointer",
              color: brand[600],
              fontWeight: 700,
              fontSize: "0.8125rem",
              "&:hover": { bgcolor: neutral[50] },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: radii.sm,
                border: `1.5px dashed ${neutral[300]}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={14} color={neutral[500]} />
            </Box>
            Create new wishlist
          </Box>
        )}
      </Box>
    </Popover>
  );
}