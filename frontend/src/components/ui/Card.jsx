import {
  Card as MuiCard,
  CardContent,
  CardMedia,
  Skeleton,
  Box,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  brand,
  neutral,
  semantic,
  fonts,
  radii,
  shadows,
  motion,
} from "../../theme/tokens";

/**
 * Card — generic surface container
 */
export function Card({
  variant = "flat",
  padding = "md",
  children,
  sx,
  ...props
}) {
  const variantSx =
    {
      flat: { boxShadow: "none" },
      raised: { boxShadow: shadows.md },
      hover: {
        boxShadow: "none",
        transition: `box-shadow ${motion.base}, transform ${motion.base}`,
        "&:hover": {
          boxShadow: shadows.cardHover,
          transform: "translateY(-2px)",
        },
      },
      interactive: {
        boxShadow: "none",
        cursor: "pointer",
        transition: `box-shadow ${motion.base}, transform ${motion.base}`,
        "&:hover": {
          boxShadow: shadows.cardHover,
          transform: "translateY(-2px)",
        },
        "&:active": { transform: "translateY(0)" },
        "&:focus-visible": {
          outline: `2px solid ${brand[500]}`,
          outlineOffset: "2px",
        },
      },
    }[variant] ?? {};

  const paddingSx =
    {
      none: { "& .MuiCardContent-root": { p: 0, "&:last-child": { pb: 0 } } },
      sm: { "& .MuiCardContent-root": { p: 2, "&:last-child": { pb: 2 } } },
      md: {},
      lg: { "& .MuiCardContent-root": { p: 4, "&:last-child": { pb: 4 } } },
    }[padding] ?? {};

  return (
    <MuiCard sx={{ ...variantSx, ...paddingSx, ...sx }} {...props}>
      {children}
    </MuiCard>
  );
}

/**
 * ListingCard — image + title/location/price, Airbnb-style
 */
export function ListingCard({ listing, to, loading = false, actions }) {
  if (loading) return <ListingCardSkeleton />;

  const { _id, title, location, country, price, image, category } = listing;
  const href = to ?? `/listings/${_id}`;

  return (
    <Box
      component={Link}
      to={href}
      sx={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        outline: "none",
      }}
    >
      <MuiCard
        elevation={0}
        sx={{
          border: "none",
          borderRadius: 0,
          background: "transparent",
          boxShadow: "none",
          transition: `transform ${motion.base}`,
          "&:hover": { transform: "translateY(-2px)" },
          "&:hover .wl-card-img": { transform: "scale(1.04)" },
          "&:focus-within": {
            outline: `2px solid ${brand[500]}`,
            outlineOffset: "2px",
            borderRadius: radii.xl,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: radii.xl,
            overflow: "hidden",
            aspectRatio: "4 / 3",
            bgcolor: neutral[100],
          }}
        >
          <CardMedia
            component="img"
            image={image?.url}
            alt={title}
            loading="lazy"
            className="wl-card-img"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: `transform 450ms ease`,
            }}
          />
          {category && (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                bgcolor: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(8px)",
                borderRadius: radii.full,
                px: 1.25,
                py: 0.4,
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "capitalize",
                color: neutral[700],
              }}
            >
              {category}
            </Box>
          )}
          {actions && (
            <Box sx={{ position: "absolute", top: 10, right: 10 }}>
              {actions}
            </Box>
          )}
        </Box>

        <CardContent sx={{ px: 0.5, pt: 1.5, pb: "0 !important" }}>
          <Typography
            sx={{
              fontSize: "0.94rem",
              fontWeight: 700,
              lineHeight: 1.35,
              mb: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: neutral[500], display: "block", mb: 0.5 }}
          >
            {location}, {country}
          </Typography>
          <Typography sx={{ fontSize: "0.9rem" }}>
            <strong>₹{Number(price).toLocaleString("en-IN")}</strong>
            <Box component="span" sx={{ color: neutral[500] }}>
              {" "}
              / night
            </Box>
          </Typography>
        </CardContent>
      </MuiCard>
    </Box>
  );
}

function ListingCardSkeleton() {
  return (
    <Box>
      <Skeleton
        variant="rounded"
        animation="wave"
        sx={{
          aspectRatio: "4/3",
          width: "100%",
          height: "auto",
          borderRadius: radii.xl,
        }}
      />
      <Box
        sx={{
          px: 0.5,
          pt: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
        }}
      >
        <Skeleton variant="text" width="70%" height={20} />
        <Skeleton variant="text" width="50%" height={16} />
        <Skeleton variant="text" width="40%" height={16} />
      </Box>
    </Box>
  );
}

/**
 * StatsCard — label + big number + trend
 */
export function StatsCard({ label, value, icon, trend, trendValue }) {
  const trendColor =
    trend === "up"
      ? semantic.success.base
      : trend === "down"
        ? semantic.error.base
        : neutral[400];

  const TrendArrow = () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={trendColor}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {trend === "up" && <path d="M18 15l-6-6-6 6" />}
      {trend === "down" && <path d="M6 9l6 6 6-6" />}
      {trend === "flat" && <path d="M5 12h14" />}
    </svg>
  );

  return (
    <MuiCard
      elevation={0}
      sx={{
        borderRadius: radii.xl,
        border: `1px solid`,
        borderColor: "divider",
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Typography variant="overline" sx={{ color: neutral[500] }}>
          {label}
        </Typography>
        {icon && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: radii.md,
              bgcolor: brand[50],
              color: brand[500],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
      <Typography
        sx={{
          fontFamily: fonts.display,
          fontSize: "2rem",
          fontWeight: 400,
          lineHeight: 1.2,
          color: neutral[800],
        }}
      >
        {value}
      </Typography>
      {trend && trendValue && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TrendArrow />
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: trendColor }}
          >
            {trendValue}
          </Typography>
        </Box>
      )}
    </MuiCard>
  );
}

export const ReviewCardDS = Card;

export default Card;
