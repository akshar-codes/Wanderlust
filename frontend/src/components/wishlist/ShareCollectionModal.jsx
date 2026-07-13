import { useState } from "react";
import { Box, Typography, Stack, Switch } from "@mui/material";
import { Copy, Check, Link2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import {
  useEnableWishlistSharing,
  useDisableWishlistSharing,
} from "../../hooks/useWishlist";
import { neutral, brand, radii } from "../../theme/tokens";

export default function ShareCollectionModal({ open, onClose, collection }) {
  const [copied, setCopied] = useState(false);
  const { mutate: enableSharing, isPending: enabling } =
    useEnableWishlistSharing();
  const { mutate: disableSharing, isPending: disabling } =
    useDisableWishlistSharing();

  const isShared = collection?.visibility === "shared";
  const shareUrl = collection?.shareToken
    ? `${window.location.origin}/wishlist/shared/${collection.shareToken}`
    : null;

  const handleToggleSharing = (e) => {
    if (!collection) return;
    if (e.target.checked) {
      enableSharing(collection._id);
    } else {
      disableSharing(collection._id);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — user can still
      // manually select and copy the visible URL text.
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share this wishlist"
      maxWidth="xs"
      actions={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <Stack spacing={2.5} pt={1}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.9375rem",
                color: neutral[800],
              }}
            >
              Public link
            </Typography>
            <Typography variant="caption" sx={{ color: neutral[500] }}>
              Anyone with the link can view this wishlist
            </Typography>
          </Box>
          <Switch
            checked={isShared}
            onChange={handleToggleSharing}
            disabled={enabling || disabling}
            color="primary"
          />
        </Box>

        {isShared && shareUrl && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.25,
              border: `1.5px solid ${neutral[200]}`,
              borderRadius: radii.lg,
              bgcolor: neutral[50],
            }}
          >
            <Link2 size={15} color={neutral[400]} style={{ flexShrink: 0 }} />
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                minWidth: 0,
                color: neutral[600],
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {shareUrl}
            </Typography>
            <Box
              component="button"
              type="button"
              onClick={handleCopy}
              aria-label="Copy link"
              sx={{
                border: "none",
                background: "none",
                cursor: "pointer",
                color: copied ? "#10b981" : brand[600],
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Box>
          </Box>
        )}
      </Stack>
    </Modal>
  );
}
