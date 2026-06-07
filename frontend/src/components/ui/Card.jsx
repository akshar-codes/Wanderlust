import { Link } from "react-router-dom";
import {
  Card as MuiCard,
  CardContent,
  CardMedia,
  CardActions,
  Skeleton,
} from "@mui/material";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import StarRating from "../common/StarRating";
import { colors, shadows, radii, motion } from "../../theme/tokens";

// ── Base Card ─────────────────────────────────────────────────────────────────

export function Card({
  variant = "flat",
  children,
  padding = "default",
  className = "",
  sx,
  ...props
}) {
  const variantSx =
    {
      flat: { boxShadow: "none" },
      raised: { boxShadow: shadows.md },
      hover: {
        boxShadow: "none",
        transition: `box-shadow ${motion.duration.base}ms ${motion.easing.easeOut}, transform ${motion.duration.base}ms ${motion.easing.easeOut}`,
        "&:hover": {
          boxShadow: shadows.cardHover,
          transform: "translateY(-2px)",
        },
      },
    }[variant] ?? {};

  const paddingSx =
    {
      none: {
        "& .MuiCardContent-root": { padding: 0, "&:last-child": { pb: 0 } },
      },
      default: {},
      lg: {
        "& .MuiCardContent-root": {
          padding: "28px 32px",
          "&:last-child": { pb: "28px" },
        },
      },
    }[padding] ?? {};

  return (
    <MuiCard
      className={className}
      sx={{ ...variantSx, ...paddingSx, ...sx }}
      {...props}
    >
      {children}
    </MuiCard>
  );
}

// ── Listing Card ───────────────────────────────────────────────────────────────
/**
 * @param {{ _id, title, location, country, price, image: { url }, category }} listing
 * @param {boolean} showTax
 * @param {boolean} loading  — renders skeleton when true
 */
export function ListingCard({ listing, showTax = false, loading = false }) {
  if (loading) return <ListingCardSkeleton />;

  const { _id, title, location, country, price, image } = listing;
  const displayPrice = showTax
    ? (price * 1.18).toLocaleString("en-IN")
    : price.toLocaleString("en-IN");

  return (
    <Link
      to={`/listings/${_id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <MuiCard
        elevation={0}
        sx={{
          border: "none",
          borderRadius: 0,
          background: "transparent",
          transition: motion.transition.base,
          "&:hover": { transform: "translateY(-2px)" },
          "&:hover .listing-card-img": { transform: "scale(1.04)" },
          "&:hover .listing-card-overlay": { background: "rgba(0,0,0,0.04)" },
        }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            borderRadius: radii.xl,
            overflow: "hidden",
            aspectRatio: "4 / 3",
          }}
        >
          <CardMedia
            component="img"
            image={image?.url}
            alt={title}
            className="listing-card-img"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: `transform 0.45s ease`,
            }}
          />
          {/* Hover overlay */}
          <div
            className="listing-card-overlay"
            style={{
              position: "absolute",
              inset: 0,
              background: "transparent",
              transition: `background ${transitions.base}`,
            }}
          />
        </div>

        {/* Body */}
        <CardContent sx={{ px: 0.5, pt: 1.5, pb: "0 !important" }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: "0.95rem",
              marginBottom: 2,
              lineHeight: 1.3,
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: "0.82rem",
              color: colors.neutral[500],
              marginBottom: 4,
            }}
          >
            {location}, {country}
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            <strong>₹{displayPrice}</strong>
            <span style={{ color: colors.neutral[500] }}> / night</span>
            {showTax && (
              <span style={{ fontSize: "0.78rem", color: colors.neutral[400] }}>
                {" "}
                (incl. 18% tax)
              </span>
            )}
          </p>
        </CardContent>
      </MuiCard>
    </Link>
  );
}

function ListingCardSkeleton() {
  return (
    <MuiCard elevation={0} sx={{ border: "none", background: "transparent" }}>
      <Skeleton
        variant="rectangular"
        sx={{ borderRadius: radii.xl, aspectRatio: "4/3", height: "auto" }}
        animation="wave"
      />
      <CardContent sx={{ px: 0.5, pt: 1.5 }}>
        <Skeleton width="70%" height={20} sx={{ mb: 0.5 }} animation="wave" />
        <Skeleton width="50%" height={16} sx={{ mb: 0.5 }} animation="wave" />
        <Skeleton width="40%" height={16} animation="wave" />
      </CardContent>
    </MuiCard>
  );
}

// ── Stats Card ────────────────────────────────────────────────────────────────
/**
 * @param {string} label
 * @param {string|number} value
 * @param {React.ReactNode} icon
 * @param {"up"|"down"|"flat"} trend
 * @param {string} trendValue  — e.g. "12%" or "3 more"
 */
export function StatsCard({ label, value, icon, trend, trendValue }) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? colors.success.main
      : trend === "down"
        ? colors.error.main
        : colors.neutral[400];

  return (
    <MuiCard
      elevation={0}
      sx={{
        borderRadius: radii.xl,
        border: `1px solid ${colors.neutral[200]}`,
        p: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        transition: `box-shadow ${motion.duration.base}ms ${motion.easing.easeOut}`,
        "&:hover": { boxShadow: shadows.md },
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: colors.neutral[500],
          }}
        >
          {label}
        </span>
        {icon && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.md,
              background: colors.brand[50],
              color: colors.brand[500],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <p
        style={{
          fontFamily: '"DM Serif Display", Georgia, serif',
          fontSize: "2rem",
          fontWeight: 400,
          lineHeight: 1.2,
          color: colors.neutral[800],
        }}
      >
        {value}
      </p>

      {/* Trend */}
      {trend && trendValue && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <TrendIcon size={14} style={{ color: trendColor }} />
          <span
            style={{ fontSize: "0.78rem", fontWeight: 600, color: trendColor }}
          >
            {trendValue}
          </span>
        </div>
      )}
    </MuiCard>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────────
/**
 * @param {{ _id, author: { username }, rating, comment, createdAt }} review
 * @param {boolean} canDelete
 * @param {Function} onDelete
 */
export function ReviewCardDS({ review, canDelete = false, onDelete }) {
  const initial = review.author?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <MuiCard
      elevation={0}
      sx={{
        borderRadius: radii.xl,
        border: `1px solid ${colors.neutral[200]}`,
        transition: `box-shadow ${transitions.base}`,
        "&:hover": { boxShadow: shadows.sm },
      }}
    >
      <CardContent>
        {/* Author row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Avatar */}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: colors.brand[50],
                color: colors.brand[600],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.9rem",
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <div>
              <p
                style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 2 }}
              >
                @{review.author?.username ?? "unknown"}
              </p>
              <StarRating rating={review.rating} size={14} />
            </div>
          </div>

          {canDelete && (
            <button
              onClick={onDelete}
              aria-label="Delete review"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: colors.neutral[400],
                padding: "4px",
                borderRadius: radii.sm,
                transition: `color ${transitions.fast}`,
                display: "flex",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = colors.error.main)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = colors.neutral[400])
              }
            >
              ✕
            </button>
          )}
        </div>

        {/* Comment */}
        <p
          style={{
            fontSize: "0.9rem",
            lineHeight: 1.6,
            color: colors.neutral[700],
            marginBottom: 8,
          }}
        >
          {review.comment}
        </p>

        {/* Date */}
        {review.createdAt && (
          <time
            dateTime={review.createdAt}
            style={{ fontSize: "0.78rem", color: colors.neutral[400] }}
          >
            {new Date(review.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        )}
      </CardContent>
    </MuiCard>
  );
}

export default Card;
