import { useRef, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { UploadCloud, X, Star } from "lucide-react";
import { motion } from "framer-motion";
import { neutral, brand, radii } from "../../../theme/tokens";
import {
  useAddListingImages,
  useRemoveListingImage,
  useSetPrimaryListingImage,
} from "../../../hooks/useListings";

const ACCEPTED = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB, matches backend upload.js
const MAX_IMAGES = 10;

export default function EditImageManager({ listingId, images = [] }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const { mutate: addImages, isPending: uploading } =
    useAddListingImages(listingId);
  const { mutate: removeImage, isPending: removing } =
    useRemoveListingImage(listingId);
  const { mutate: setPrimary, isPending: settingPrimary } =
    useSetPrimaryListingImage(listingId);

  const busy = uploading || removing || settingPrimary;

  const handleFiles = (fileList) => {
    const incoming = Array.from(fileList);
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      setError(`You can have up to ${MAX_IMAGES} photos on a listing.`);
      return;
    }
    const valid = [];
    for (const file of incoming.slice(0, room)) {
      if (!ACCEPTED.includes(file.type)) {
        setError("Only JPG, PNG, or WebP images are allowed.");
        continue;
      }
      if (file.size > MAX_SIZE) {
        setError("Each image must be under 10MB.");
        continue;
      }
      valid.push(file);
    }
    if (valid.length) {
      setError("");
      addImages(valid);
    }
  };

  const handleDelete = (imageId) => {
    if (images.length <= 1) return;
    if (window.confirm("Remove this photo from the listing?")) {
      removeImage(imageId);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="body2" sx={{ color: neutral[500] }}>
        Photo changes are saved immediately — no need to click "Save changes".
      </Typography>

      {images.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 1.5,
          }}
        >
          {images.map((img) => (
            <Box
              key={img._id}
              component={motion.div}
              layout
              sx={{
                position: "relative",
                borderRadius: radii.lg,
                overflow: "hidden",
                aspectRatio: "4/3",
                border: `1.5px solid ${img.isPrimary ? brand[500] : neutral[200]}`,
                opacity: busy ? 0.7 : 1,
              }}
            >
              <img
                src={img.url}
                alt={img.caption ?? "Listing photo"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {img.isPrimary ? (
                <Box
                  sx={{
                    position: "absolute",
                    top: 6,
                    left: 6,
                    bgcolor: brand[500],
                    color: "#fff",
                    borderRadius: 999,
                    px: 1,
                    py: 0.25,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.4,
                  }}
                >
                  <Star size={10} fill="#fff" /> Cover
                </Box>
              ) : (
                <Box
                  component="button"
                  type="button"
                  disabled={busy}
                  onClick={() => setPrimary(img._id)}
                  sx={{
                    position: "absolute",
                    top: 6,
                    left: 6,
                    bgcolor: "rgba(255,255,255,0.92)",
                    color: neutral[700],
                    borderRadius: 999,
                    px: 1,
                    py: 0.25,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.4,
                    border: "none",
                    cursor: busy ? "not-allowed" : "pointer",
                  }}
                >
                  <Star size={10} /> Make cover
                </Box>
              )}

              <Box
                component="button"
                type="button"
                disabled={busy || images.length <= 1}
                onClick={() => handleDelete(img._id)}
                title={
                  images.length <= 1
                    ? "A listing needs at least one photo"
                    : "Remove photo"
                }
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  bgcolor: "rgba(20,13,8,0.65)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  cursor:
                    busy || images.length <= 1 ? "not-allowed" : "pointer",
                  opacity: images.length <= 1 ? 0.4 : 1,
                }}
              >
                <X size={13} color="#fff" />
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !busy && inputRef.current?.click()}
        sx={{
          border: `2px dashed ${dragOver ? brand[500] : neutral[300]}`,
          borderRadius: radii.xl,
          bgcolor: dragOver ? brand[50] : neutral[50],
          py: 4,
          px: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          cursor: busy ? "not-allowed" : "pointer",
          transition: "all 150ms",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {uploading ? (
          <CircularProgress size={22} sx={{ color: brand[500] }} />
        ) : (
          <UploadCloud size={24} color={dragOver ? brand[500] : neutral[400]} />
        )}
        <Typography
          sx={{ fontWeight: 600, fontSize: "0.875rem", color: neutral[700] }}
        >
          {uploading ? "Uploading…" : "Drag photos here, or click to browse"}
        </Typography>
        <Typography variant="caption" sx={{ color: neutral[400] }}>
          JPG, PNG, or WebP · up to 10MB each · {images.length}/{MAX_IMAGES}{" "}
          used
        </Typography>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </Box>

      {error && (
        <Typography variant="caption" sx={{ color: "error.main" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
