import { useRef, useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { UploadCloud, X, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { neutral, brand, radii } from "../../../../theme/tokens";

const ACCEPTED = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB, matches backend upload.js
const MAX_IMAGES = 10;

export default function StepImages({ images, setImages }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const addFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList);
      const room = MAX_IMAGES - images.length;
      if (room <= 0) {
        setError(`You can upload up to ${MAX_IMAGES} photos.`);
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
        valid.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
      if (valid.length) {
        setError("");
        setImages((prev) => [...prev, ...valid]);
      }
    },
    [images.length, setImages],
  );

  const removeImage = (id) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const move = (index, dir) => {
    setImages((prev) => {
      const next = [...prev];
      const swapWith = index + dir;
      if (swapWith < 0 || swapWith >= next.length) return prev;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography
          sx={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.5rem",
            color: neutral[800],
            mb: 0.5,
          }}
        >
          Add some photos
        </Typography>
        <Typography variant="body2" sx={{ color: neutral[500] }}>
          The first photo becomes your cover image. Drag to reorder, or upload
          up to {MAX_IMAGES}.
        </Typography>
      </Box>

      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        sx={{
          border: `2px dashed ${dragOver ? brand[500] : neutral[300]}`,
          borderRadius: radii.xl,
          bgcolor: dragOver ? brand[50] : neutral[50],
          py: 6,
          px: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          transition: "all 150ms",
        }}
      >
        <UploadCloud size={28} color={dragOver ? brand[500] : neutral[400]} />
        <Typography sx={{ fontWeight: 600, color: neutral[700] }}>
          Drag photos here, or click to browse
        </Typography>
        <Typography variant="caption" sx={{ color: neutral[400] }}>
          JPG, PNG, or WebP · up to 10MB each
        </Typography>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </Box>

      {error && (
        <Typography variant="caption" sx={{ color: "error.main" }}>
          {error}
        </Typography>
      )}

      {images.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 1.5,
          }}
        >
          {images.map((img, i) => (
            <Box
              key={img.id}
              component={motion.div}
              layout
              sx={{
                position: "relative",
                borderRadius: radii.lg,
                overflow: "hidden",
                aspectRatio: "4/3",
                border: `1.5px solid ${i === 0 ? brand[500] : neutral[200]}`,
              }}
            >
              <img
                src={img.previewUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {i === 0 && (
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
              )}
              <Box
                onClick={() => removeImage(img.id)}
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
                  cursor: "pointer",
                }}
              >
                <X size={13} color="#fff" />
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 6,
                  left: 6,
                  right: 6,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  onClick={() => move(i, -1)}
                  sx={{
                    visibility: i === 0 ? "hidden" : "visible",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ChevronLeft size={13} />
                </Box>
                <Box
                  onClick={() => move(i, 1)}
                  sx={{
                    visibility: i === images.length - 1 ? "hidden" : "visible",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ChevronRight size={13} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
