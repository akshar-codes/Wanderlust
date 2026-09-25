import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, TrendingUp } from "lucide-react";
import WishlistHeartButton from "../wishlist/WishlistHeartButton";
import { cloudinaryUrl } from "../../utils/cloudinaryUrl";
import { formatPrice } from "../../utils/currency";

const CATEGORY_ICONS = {
  trending: "🔥",
  rooms: "🛏",
  iconic: "🏙",
  mountains: "⛰",
  castles: "🏰",
  pools: "🏊",
  camping: "⛺",
  farms: "🐄",
  arctic: "❄️",
  domes: "🛖",
  boats: "⛵",
};

export default function ListingCard({
  listing,
  variant = "default",
  showTax = false,
  index = 0,
  noLink = false,
}) {
  const {
    _id,
    title,
    location,
    country,
    price,
    pricing,
    images,
    image,
    category,
    averageRating,
    reviewCount,
    featured,
  } = listing;

  const activePrice = pricing?.nightlyPrice ?? price ?? 0;
  const displayPrice = showTax ? activePrice * 1.18 : activePrice;

  const seed = _id ? parseInt(_id.slice(-4), 16) : index;
  const rating = averageRating ?? (4.2 + (seed % 8) * 0.1).toFixed(1);
  const reviews = reviewCount ?? 12 + (seed % 88);

  const rawImage = images?.[0]?.url ?? image?.url;
  const displayImage = cloudinaryUrl(rawImage, { width: 640 });
  const isFeatured = variant === "featured" || featured;

  const Wrapper = noLink ? "div" : Link;
  const wrapperProps = noLink
    ? { style: { display: "block" } }
    : {
        to: `/listings/${_id}`,
        style: { textDecoration: "none", color: "inherit", display: "block" },
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Wrapper {...wrapperProps}>
        <motion.article
          whileHover="hover"
          initial="rest"
          animate="rest"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {/* Image */}
          <div
            style={{
              position: "relative",
              borderRadius: 20,
              overflow: "hidden",
              aspectRatio: "4/3",
              background: "var(--color-surface-2)",
            }}
          >
            <motion.img
              variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              src={displayImage}
              alt={title}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Gradient overlay */}
            <motion.div
              variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(20,13,8,0.35) 0%, transparent 60%)",
              }}
            />

            {/* Top-left Badges */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                display: "flex",
                gap: 5,
              }}
            >
              {isFeatured ? (
                <div
                  style={{
                    background: `var(--color-primary-500)`, // Can use gradient here in future if we want
                    backgroundImage: `linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))`,
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <TrendingUp size={11} /> Featured
                </div>
              ) : (
                <div
                  style={{
                    background: "var(--color-surface)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#3d3630",
                    letterSpacing: "0.04em",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>{CATEGORY_ICONS[category] ?? "🏠"}</span>
                  <span style={{ textTransform: "capitalize" }}>
                    {category || "Stay"}
                  </span>
                </div>
              )}
            </div>

            {/* Wishlist Heart - Absolutely positioned */}
            <div style={{ position: "absolute", top: 10, right: 10 }}>
              <WishlistHeartButton listingId={_id} size={34} iconSize={15} />
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "0 2px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 4,
              }}
            >
              <MapPin size={11} color="var(--color-text-muted)" />
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {location}, {country}
              </span>
            </div>

            <h3
              style={{
                fontFamily:
                  variant === "default"
                    ? "var(--font-display)"
                    : "var(--font-body)",
                fontSize: variant === "default" ? "1.05rem" : "0.9375rem",
                fontWeight: variant === "default" ? 400 : 700,
                color: "var(--color-text)",
                lineHeight: 1.35,
                marginBottom: 8,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {formatPrice(displayPrice)}
                </span>
                <span
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.8125rem",
                  }}
                >
                  {" "}
                  / night
                </span>
                {showTax && (
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--color-text-muted)",
                      marginTop: 1,
                    }}
                  >
                    incl. 18% tax
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Star size={13} fill="var(--color-warning)" stroke="none" />
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--color-text)",
                  }}
                >
                  {rating}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  ({reviews})
                </span>
              </div>
            </div>
          </div>
        </motion.article>
      </Wrapper>
    </motion.div>
  );
}
