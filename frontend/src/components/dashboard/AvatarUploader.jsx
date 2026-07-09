import { useRef } from "react";
import { Box, Typography, Stack, CircularProgress } from "@mui/material";
import { Camera, Trash2 } from "lucide-react";
import { neutral, brand } from "../../theme/tokens";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Shared avatar upload/remove widget.
 * Extracted from the dashboard ProfileSection so the redesigned public
 * profile page can reuse the exact same upload logic without duplicating it.
 */
export default function AvatarUploader({
  avatarUrl,
  name,
  size = 84,
  uploading,
  onUpload,
  onRemove,
  showLabel = true,
}) {
  const inputRef = useRef(null);
  const initial = name?.[0]?.toUpperCase() ?? "?";

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return onUpload(null, "Only JPG, PNG, or WebP images are allowed.");
    }
    if (file.size > MAX_AVATAR_SIZE) {
      return onUpload(null, "Image must be under 5MB.");
    }
    onUpload(file, null);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
      <Box
        sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}
      >
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            overflow: "hidden",
            bgcolor: brand[100],
            color: brand[700],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.42,
            fontWeight: 700,
            border: `2px solid ${neutral[200]}`,
          }}
        >
          {avatarUrl ? (
            <Box
              component="img"
              src={avatarUrl}
              alt={name}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initial
          )}
        </Box>
        {uploading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              bgcolor: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={size * 0.26} sx={{ color: "#fff" }} />
          </Box>
        )}
        <Box
          component="button"
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile photo"
          sx={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: Math.max(26, size * 0.36),
            height: Math.max(26, size * 0.36),
            borderRadius: "50%",
            bgcolor: brand[500],
            color: "#fff",
            border: "2px solid #fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          <Camera size={Math.max(12, size * 0.17)} />
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          hidden
          onChange={handleFile}
        />
      </Box>

      {showLabel && (
        <Stack spacing={0.75}>
          <Typography
            sx={{ fontWeight: 700, fontSize: "0.9375rem", color: neutral[800] }}
          >
            Profile photo
          </Typography>
          <Typography variant="caption" sx={{ color: neutral[500] }}>
            JPG, PNG, or WebP · up to 5MB
          </Typography>
          {avatarUrl && onRemove && (
            <Box
              component="button"
              type="button"
              onClick={onRemove}
              disabled={uploading}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                border: "none",
                background: "none",
                cursor: uploading ? "not-allowed" : "pointer",
                color: "error.main",
                fontSize: "0.8125rem",
                fontWeight: 600,
                p: 0,
                width: "fit-content",
                fontFamily: "inherit",
              }}
            >
              <Trash2 size={13} /> Remove photo
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}
