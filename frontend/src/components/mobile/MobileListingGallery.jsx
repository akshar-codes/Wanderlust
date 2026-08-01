import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { neutral } from "../../theme/tokens";

/**
 * Swipeable, snap-to-image gallery for the mobile listing detail page.
 * Supports drag-to-swipe plus left/right tap zones. Falls back to a
 * placeholder when the listing has no images.
 */
export default function MobileListingGallery({ images = [], title, onImageTap }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);

  if (images.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          background: neutral[100],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.5rem",
        }}
      >
        🏠
      </div>
    );
  }

  const handleDragEnd = (_, info) => {
    const threshold = 60;
    if (info.offset.x < -threshold && index < images.length - 1) {
      setIndex((i) => i + 1);
    } else if (info.offset.x > threshold && index > 0) {
      setIndex((i) => i - 1);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", aspectRatio: "4/3", overflow: "hidden", background: neutral[100] }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: "absolute", inset: 0 }}
          onClick={() => onImageTap?.(index)}
        >
          <img
            src={images[index]?.url}
            alt={`${title} — photo ${index + 1}`}
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Tap zones for prev/next */}
      <button
        aria-label="Previous photo"
        onClick={() => setIndex((i) => Math.max(0, i - 1))}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "35%",
          border: "none",
          background: "none",
          cursor: images.length > 1 ? "pointer" : "default",
        }}
      />
      <button
        aria-label="Next photo"
        onClick={() => setIndex((i) => Math.min(images.length - 1, i + 1))}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "35%",
          border: "none",
          background: "none",
          cursor: images.length > 1 ? "pointer" : "default",
        }}
      />

      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "rgba(20,13,8,0.6)",
            color: "#fff",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 999,
          }}
        >
          {index + 1} / {images.length}
        </div>
      )}

      {images.length > 1 && (
        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
          {images.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === index ? 16 : 6,
                height: 6,
                borderRadius: 999,
                background: i === index ? "#fff" : "rgba(255,255,255,0.55)",
                transition: "width 0.2s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
