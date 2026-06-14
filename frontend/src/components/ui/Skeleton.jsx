import { Skeleton as MuiSkeleton, Box } from "@mui/material";
import { radii } from "../../theme/tokens";

/**
 * Skeleton — base primitive (thin wrapper over MUI Skeleton)
 */
export function Skeleton({ variant = "rounded", sx, ...props }) {
  return <MuiSkeleton variant={variant} animation="wave" sx={sx} {...props} />;
}

/**
 * Skeleton.Card — listing card placeholder (image + 3 text lines)
 */
function SkeletonCard() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Skeleton
        sx={{
          aspectRatio: "4/3",
          width: "100%",
          height: "auto",
          borderRadius: radii.xl,
        }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
          px: 0.5,
          pt: 0.5,
        }}
      >
        <Skeleton variant="text" width="40%" height={13} />
        <Skeleton variant="text" width="75%" height={18} />
        <Skeleton variant="text" width="55%" height={14} />
      </Box>
    </Box>
  );
}

/**
 * Skeleton.Grid — grid of card skeletons
 */
function SkeletonGrid({ count = 6, minColumnWidth = 260 }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: "24px 20px",
        gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </Box>
  );
}

/**
 * Skeleton.Text — stacked text lines of varying width
 */
function SkeletonText({ lines = 3, lastLineWidth = "60%" }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? lastLineWidth : "100%"}
        />
      ))}
    </Box>
  );
}

/**
 * Skeleton.Avatar — circular avatar placeholder with optional text lines
 */
function SkeletonAvatar({ size = 40, lines = 2 }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Skeleton variant="circular" width={size} height={size} />
      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.75 }}
      >
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton
            key={i}
            variant="text"
            height={14}
            width={i === 0 ? "50%" : "30%"}
          />
        ))}
      </Box>
    </Box>
  );
}

/**
 * Skeleton.Form — label+input pairs, for form-loading states
 * Props: fields (default 4)
 */
function SkeletonForm({ fields = 4 }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {Array.from({ length: fields }, (_, i) => (
        <Box
          key={i}
          sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}
        >
          <Skeleton variant="text" width="28%" height={14} />
          <Skeleton
            variant="rounded"
            height={44}
            sx={{ borderRadius: radii.lg }}
          />
        </Box>
      ))}
      <Skeleton
        variant="rounded"
        height={48}
        sx={{ borderRadius: radii.full, mt: 1 }}
      />
    </Box>
  );
}

Skeleton.Card = SkeletonCard;
Skeleton.Grid = SkeletonGrid;
Skeleton.Text = SkeletonText;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Form = SkeletonForm;

export default Skeleton;
