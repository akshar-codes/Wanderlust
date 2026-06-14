import {
  Avatar as MuiAvatar,
  AvatarGroup as MuiAvatarGroup,
  Box,
} from "@mui/material";
import { brand, teal, semantic, radii } from "../../theme/tokens";

const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };

const COLOR_RAMP = [
  { bg: brand[50], fg: brand[700] },
  { bg: teal[100], fg: teal[700] },
  { bg: "#FEF3C7", fg: "#92400E" },
  { bg: "#DBEAFE", fg: "#1E40AF" },
  { bg: "#F4E1FE", fg: "#7C2D92" },
];

function hashString(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const STATUS_COLORS = {
  online: semantic.success.base,
  away: semantic.warning.base,
  offline: "#9CA3AF",
};

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  status,
  square = false,
  sx,
  ...props
}) {
  const px = typeof size === "number" ? size : (SIZES[size] ?? SIZES.md);
  const palette = COLOR_RAMP[hashString(name) % COLOR_RAMP.length];

  const avatar = (
    <MuiAvatar
      src={src}
      alt={alt ?? name ?? "Avatar"}
      sx={{
        width: px,
        height: px,
        fontSize: px * 0.4,
        borderRadius: square ? radii.lg : "50%",
        ...(!src && name ? { bgcolor: palette.bg, color: palette.fg } : {}),
        ...sx,
      }}
      {...props}
    >
      {!src && name ? getInitials(name) : undefined}
    </MuiAvatar>
  );

  if (!status) return avatar;

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        width: px,
        height: px,
      }}
    >
      {avatar}
      <Box
        aria-label={`Status: ${status}`}
        sx={{
          position: "absolute",
          bottom: -1,
          right: -1,
          width: Math.max(8, px * 0.26),
          height: Math.max(8, px * 0.26),
          borderRadius: "50%",
          bgcolor: STATUS_COLORS[status] ?? STATUS_COLORS.offline,
          border: "2px solid",
          borderColor: "background.paper",
        }}
      />
    </Box>
  );
}

export function AvatarGroup({ max = 4, size = "md", items, children }) {
  const px = typeof size === "number" ? size : (SIZES[size] ?? SIZES.md);
  return (
    <MuiAvatarGroup
      max={max}
      sx={{
        "& .MuiAvatar-root": { width: px, height: px, fontSize: px * 0.38 },
      }}
    >
      {items
        ? items.map((it, i) => (
            <Avatar key={i} src={it.src} name={it.name} size={size} />
          ))
        : children}
    </MuiAvatarGroup>
  );
}

export default Avatar;
