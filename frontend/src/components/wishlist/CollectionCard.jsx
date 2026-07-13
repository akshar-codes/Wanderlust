import { Box, Typography } from "@mui/material";
import { Heart, Lock, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { neutral, brand, radii, shadows } from "../../theme/tokens";

export default function CollectionCard({ collection, onClick }) {
  const { name, itemCount, coverImage, visibility, isDefault } = collection;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <Box
        sx={{
          position: "relative",
          borderRadius: radii["2xl"],
          overflow: "hidden",
          aspectRatio: "4/3",
          bgcolor: neutral[100],
          boxShadow: shadows.card,
        }}
      >
        {coverImage ? (
          <Box
            component="img"
            src={coverImage}
            alt={name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, ${brand[50]}, ${brand[100]})`,
            }}
          >
            <Heart size={40} color={brand[300]} />
          </Box>
        )}

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(20,13,8,0.55) 0%, transparent 55%)",
          }}
        />

        <Box sx={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.0625rem",
              mb: 0.25,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {name}
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8125rem" }}
          >
            {itemCount ?? 0} {itemCount === 1 ? "saved stay" : "saved stays"}
          </Typography>
        </Box>

        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 30,
            height: 30,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {visibility === "shared" ? (
            <Globe size={14} color={neutral[700]} />
          ) : (
            <Lock size={13} color={neutral[700]} />
          )}
        </Box>

        {isDefault && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              bgcolor: brand[500],
              color: "#fff",
              borderRadius: 999,
              px: 1.1,
              py: 0.3,
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Default
          </Box>
        )}
      </Box>
    </motion.div>
  );
}
