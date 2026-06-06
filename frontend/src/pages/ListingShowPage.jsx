import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Pencil,
  Trash2,
  MapPin,
  Globe,
  User,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Share2,
  Heart,
  Shield,
  Award,
  MessageCircle,
  Calendar,
  Clock,
  Home,
  Users,
  Wifi,
  Coffee,
  Car,
  Waves,
  Trees,
  Flame,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import {
  Chip,
  LinearProgress,
  Tooltip,
  Skeleton,
  Collapse,
  IconButton,
} from "@mui/material";
import { useListing, useDeleteListing } from "../hooks/useListings";
import { useAuthStore } from "../store/auth.store";
import ReviewCard from "../components/reviews/ReviewCard";
import ReviewForm from "../components/reviews/ReviewForm";
import ListingMap from "../components/map/ListingMap";
import Spinner from "../components/common/Spinner";

function idEquals(a, b) {
  if (!a || !b) return false;
  return String(a) === String(b);
}

/* ─── Amenity icon map ─────────────────────────────────────────────────────── */
const AMENITY_ICONS = {
  Wifi: <Wifi size={18} />,
  Kitchen: <Coffee size={18} />,
  Parking: <Car size={18} />,
  Pool: <Waves size={18} />,
  Garden: <Trees size={18} />,
  Fireplace: <Flame size={18} />,
};

const AMENITIES_BY_CATEGORY = {
  trending: ["Wifi", "Kitchen", "Parking"],
  rooms: ["Wifi", "Kitchen"],
  iconic: ["Wifi", "Kitchen", "Parking", "Pool"],
  mountains: ["Wifi", "Fireplace", "Parking"],
  castles: ["Wifi", "Kitchen", "Parking", "Garden"],
  pools: ["Wifi", "Kitchen", "Parking", "Pool"],
  camping: ["Parking", "Fireplace", "Garden"],
  farms: ["Parking", "Kitchen", "Garden"],
  arctic: ["Wifi", "Fireplace", "Parking"],
  domes: ["Wifi", "Kitchen", "Parking"],
  boats: ["Wifi", "Kitchen"],
};

/* ─── Rating distribution (synthetic from reviews) ─────────────────────────── */
function buildRatingDist(reviews) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    dist[r.rating] = (dist[r.rating] || 0) + 1;
  });
  return dist;
}

/* ─── Lightbox ────────────────────────────────────────────────────────────── */
function Lightbox({ images, initialIdx, onClose }) {
  const [idx, setIdx] = useState(initialIdx);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIdx((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  const prev = useCallback(
    (e) => {
      e.stopPropagation();
      setIdx((i) => (i - 1 + images.length) % images.length);
      setZoomed(false);
    },
    [images.length],
  );

  const next = useCallback(
    (e) => {
      e.stopPropagation();
      setIdx((i) => (i + 1) % images.length);
      setZoomed(false);
    },
    [images.length],
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        background: "rgba(0,0,0,0.93)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "50%",
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          cursor: "pointer",
          zIndex: 1,
          transition: "background 150ms",
        }}
        aria-label="Close lightbox"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <span
        style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.7)",
          fontSize: "0.82rem",
          letterSpacing: "0.08em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {idx + 1} / {images.length}
      </span>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={prev}
          style={{
            position: "absolute",
            left: 20,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            cursor: "pointer",
            transition: "background 150ms",
          }}
          aria-label="Previous image"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          cursor: zoomed ? "zoom-out" : "zoom-in",
          transition: "transform 280ms cubic-bezier(0.4,0,0.2,1)",
          transform: zoomed ? "scale(1.6)" : "scale(1)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setZoomed((z) => !z);
        }}
      >
        <img
          src={images[idx]}
          alt={`Gallery image ${idx + 1}`}
          style={{
            display: "block",
            maxWidth: "90vw",
            maxHeight: "90vh",
            borderRadius: 8,
            objectFit: "contain",
            userSelect: "none",
          }}
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={next}
          style={{
            position: "absolute",
            right: 20,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            cursor: "pointer",
            transition: "background 150ms",
          }}
          aria-label="Next image"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => {
                setIdx(i);
                setZoomed(false);
              }}
              style={{
                width: 48,
                height: 36,
                borderRadius: 6,
                overflow: "hidden",
                border:
                  i === idx ? "2px solid #fe424d" : "2px solid transparent",
                opacity: i === idx ? 1 : 0.5,
                cursor: "pointer",
                padding: 0,
                transition: "opacity 150ms, border-color 150ms",
              }}
              aria-label={`Go to image ${i + 1}`}
            >
              <img
                src={src}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Gallery ─────────────────────────────────────────────────────────────── */
function Gallery({ images, title }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const hasMany = images.length > 1;

  if (images.length === 0) {
    return (
      <div
        style={{
          height: 420,
          background: "#f2f2f2",
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#b0b0b0",
          fontSize: "0.9rem",
        }}
      >
        No image available
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <>
        <div
          style={{
            position: "relative",
            borderRadius: 18,
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={() => setLightboxIdx(0)}
        >
          <img
            src={images[0]}
            alt={title}
            style={{
              width: "100%",
              maxHeight: 520,
              objectFit: "cover",
              display: "block",
            }}
          />
          <div style={galleryOverlayStyle}>
            <ZoomIn size={16} />
            <span>View photo</span>
          </div>
        </div>
        {lightboxIdx !== null && (
          <Lightbox
            images={images}
            initialIdx={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </>
    );
  }

  /* Multi-image mosaic */
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "260px 200px",
          gap: 8,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {/* Main image */}
        <div
          style={{
            gridRow: "1 / 3",
            position: "relative",
            cursor: "pointer",
            overflow: "hidden",
          }}
          onClick={() => setLightboxIdx(0)}
        >
          <img
            src={images[0]}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 500ms ease",
              display: "block",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          <div style={galleryOverlayStyle}>
            <ZoomIn size={14} />
            <span>View</span>
          </div>
        </div>

        {/* Side images */}
        {images.slice(1, 3).map((src, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              cursor: "pointer",
              overflow: "hidden",
            }}
            onClick={() => setLightboxIdx(i + 1)}
          >
            <img
              src={src}
              alt={`${title} ${i + 2}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 500ms ease",
                display: "block",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.04)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
            {/* "Show all" badge on last visible thumbnail */}
            {i === 1 && images.length > 3 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.42)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  gap: 6,
                }}
              >
                <ZoomIn size={18} />+{images.length - 3} more
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          initialIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

const galleryOverlayStyle = {
  position: "absolute",
  bottom: 12,
  right: 12,
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(6px)",
  borderRadius: 20,
  padding: "6px 12px",
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#222",
  cursor: "pointer",
  transition: "opacity 150ms",
};

/* ─── Review Statistics ───────────────────────────────────────────────────── */
function ReviewStats({ reviews, avgRating }) {
  if (reviews.length === 0) return null;
  const dist = buildRatingDist(reviews);

  const CRITERIA = [
    { label: "Cleanliness", score: Math.min(5, avgRating + 0.2) },
    { label: "Communication", score: Math.min(5, avgRating + 0.1) },
    { label: "Check-in", score: Math.min(5, avgRating - 0.1) },
    { label: "Accuracy", score: Math.min(5, avgRating) },
    { label: "Location", score: Math.min(5, avgRating + 0.3) },
    { label: "Value", score: Math.min(5, avgRating - 0.2) },
  ];

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: 20,
        padding: "28px 32px",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "28px 40px",
        alignItems: "start",
      }}
    >
      {/* Overall score */}
      <div style={{ textAlign: "center", minWidth: 100 }}>
        <div
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: "4rem",
            lineHeight: 1,
            color: "#222",
            marginBottom: 6,
          }}
        >
          {avgRating.toFixed(1)}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            marginBottom: 6,
          }}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={16}
              fill={s <= Math.round(avgRating) ? "#f59e0b" : "none"}
              stroke={s <= Math.round(avgRating) ? "#f59e0b" : "#d1d5db"}
              strokeWidth={1.5}
            />
          ))}
        </div>
        <p style={{ fontSize: "0.78rem", color: "#717171" }}>
          {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Rating bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = dist[star] || 0;
          const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
          return (
            <div
              key={star}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <span
                style={{ fontSize: "0.78rem", color: "#555", minWidth: 12 }}
              >
                {star}
              </span>
              <Star
                size={11}
                fill="#f59e0b"
                stroke="none"
                style={{ flexShrink: 0 }}
              />
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: "#f2f2f2",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "#222",
                    borderRadius: 4,
                    transition: "width 600ms cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#888",
                  minWidth: 28,
                  textAlign: "right",
                }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Criteria grid */}
      <div
        style={{
          gridColumn: "1 / -1",
          borderTop: "1px solid #f2f2f2",
          paddingTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px 24px",
        }}
      >
        {CRITERIA.map(({ label, score }) => (
          <div key={label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
              }}
            >
              <span
                style={{ fontSize: "0.82rem", color: "#555", fontWeight: 500 }}
              >
                {label}
              </span>
              <span
                style={{ fontSize: "0.82rem", fontWeight: 700, color: "#222" }}
              >
                {score.toFixed(1)}
              </span>
            </div>
            <LinearProgress
              variant="determinate"
              value={(score / 5) * 100}
              sx={{
                height: 4,
                borderRadius: 4,
                background: "#f2f2f2",
                "& .MuiLinearProgress-bar": {
                  background: "#222",
                  borderRadius: 4,
                },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Host Profile ────────────────────────────────────────────────────────── */
function HostProfile({ owner, createdAt }) {
  const joinYear = createdAt ? new Date(createdAt).getFullYear() : 2023;
  const initial = owner?.username?.[0]?.toUpperCase() ?? "H";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: 20,
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fe424d 0%, #e5323d 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: "1.6rem",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
        <div>
          <div
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: "1.3rem",
              color: "#222",
              marginBottom: 2,
            }}
          >
            {owner?.username ?? "Your Host"}
          </div>
          <p style={{ fontSize: "0.8rem", color: "#717171" }}>
            Joined in {joinYear}
          </p>
        </div>
      </div>

      {/* Host stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          paddingTop: 4,
        }}
      >
        {[
          { icon: <Star size={16} />, label: "Reviews", value: "4.9★" },
          { icon: <Award size={16} />, label: "Status", value: "Superhost" },
          {
            icon: <Calendar size={16} />,
            label: "Years",
            value: `${new Date().getFullYear() - joinYear + 1}`,
          },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: "14px 12px",
              background: "#f9f9f9",
              borderRadius: 14,
              alignItems: "flex-start",
            }}
          >
            <span style={{ color: "#717171" }}>{icon}</span>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "#222" }}>
              {value}
            </span>
            <span style={{ fontSize: "0.72rem", color: "#888" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingTop: 4,
        }}
      >
        {[
          { icon: <Shield size={16} />, text: "Identity verified" },
          {
            icon: <CheckCircle2 size={16} />,
            text: "Superhost — Top-rated host",
          },
          {
            icon: <MessageCircle size={16} />,
            text: "Responds within an hour",
          },
        ].map(({ icon, text }) => (
          <div
            key={text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#555",
              fontSize: "0.85rem",
            }}
          >
            <span style={{ color: "#22c55e", flexShrink: 0 }}>{icon}</span>
            {text}
          </div>
        ))}
      </div>

      <Link
        to="#"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 24px",
          border: "1.5px solid #222",
          borderRadius: 12,
          fontWeight: 600,
          fontSize: "0.88rem",
          color: "#222",
          textDecoration: "none",
          transition: "background 150ms",
          marginTop: 4,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f2f2f2")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <MessageCircle size={15} style={{ marginRight: 8 }} />
        Message host
      </Link>
    </div>
  );
}

/* ─── Sticky Booking Card ─────────────────────────────────────────────────── */
function BookingCard({
  price,
  avgRating,
  reviewCount,
  isOwner,
  listingId,
  onDelete,
  isDeleting,
}) {
  const [nights, setNights] = useState(3);
  const taxRate = 0.18;
  const baseTotal = price * nights;
  const taxes = Math.round(baseTotal * taxRate);
  const grandTotal = baseTotal + taxes;

  return (
    <div
      style={{
        position: "sticky",
        top: 88,
        background: "#fff",
        border: "1.5px solid #e8e8e8",
        borderRadius: 24,
        padding: "28px 28px 24px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Price headline */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: "1.9rem",
              color: "#222",
            }}
          >
            ₹{price.toLocaleString("en-IN")}
          </span>
          <span style={{ fontSize: "0.88rem", color: "#717171" }}>
            {" "}
            / night
          </span>
        </div>
        {avgRating > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.82rem",
              color: "#555",
            }}
          >
            <Star size={14} fill="#f59e0b" stroke="none" />
            <span style={{ fontWeight: 700 }}>{avgRating.toFixed(2)}</span>
            <span style={{ color: "#b0b0b0" }}>·</span>
            <span style={{ textDecoration: "underline", color: "#717171" }}>
              {reviewCount} review{reviewCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Date-picker placeholder */}
      <div
        style={{
          border: "1.5px solid #e8e8e8",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: "1px solid #e8e8e8",
          }}
        >
          {[
            { label: "CHECK-IN", value: "Add date" },
            { label: "CHECKOUT", value: "Add date", borderLeft: true },
          ].map(({ label, value, borderLeft }) => (
            <div
              key={label}
              style={{
                padding: "12px 16px",
                borderLeft: borderLeft ? "1px solid #e8e8e8" : "none",
                cursor: "pointer",
              }}
            >
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#555",
                  marginBottom: 2,
                }}
              >
                {label}
              </p>
              <p style={{ fontSize: "0.88rem", color: "#717171" }}>{value}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", cursor: "pointer" }}>
          <p
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#555",
              marginBottom: 2,
            }}
          >
            GUESTS
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: "0.88rem", color: "#717171" }}>1 guest</p>
            <ChevronDown size={16} style={{ color: "#717171" }} />
          </div>
        </div>
      </div>

      {/* Nights slider */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: "0.82rem", color: "#555", fontWeight: 500 }}>
            Nights
          </span>
          <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>{nights}</span>
        </div>
        <input
          type="range"
          min={1}
          max={14}
          value={nights}
          onChange={(e) => setNights(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#fe424d", cursor: "pointer" }}
        />
      </div>

      {/* Reserve button */}
      <button
        style={{
          background: "linear-gradient(135deg, #fe424d 0%, #e5323d 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "16px",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: "pointer",
          transition: "transform 120ms, box-shadow 120ms",
          boxShadow: "0 4px 20px rgba(254,66,77,0.35)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 8px 28px rgba(254,66,77,0.45)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(254,66,77,0.35)";
        }}
      >
        Reserve
      </button>

      {/* Price breakdown */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingTop: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.88rem",
            color: "#555",
          }}
        >
          <span style={{ textDecoration: "underline" }}>
            ₹{price.toLocaleString("en-IN")} × {nights} nights
          </span>
          <span>₹{baseTotal.toLocaleString("en-IN")}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.88rem",
            color: "#555",
          }}
        >
          <span style={{ textDecoration: "underline" }}>
            Taxes &amp; fees (18%)
          </span>
          <span>₹{taxes.toLocaleString("en-IN")}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#222",
            borderTop: "1px solid #e8e8e8",
            paddingTop: 10,
            marginTop: 2,
          }}
        >
          <span>Total before taxes</span>
          <span>₹{grandTotal.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Owner actions */}
      {isOwner && (
        <div
          style={{
            display: "flex",
            gap: 8,
            borderTop: "1px solid #f2f2f2",
            paddingTop: 16,
          }}
        >
          <Link
            to={`/listings/${listingId}/edit`}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px",
              border: "1.5px solid #e8e8e8",
              borderRadius: 12,
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#222",
              textDecoration: "none",
              transition: "background 150ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Pencil size={14} />
            Edit
          </Link>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px",
              background: isDeleting ? "#f9f9f9" : "#fee2e2",
              border: "1.5px solid #fca5a5",
              borderRadius: 12,
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#b91c1c",
              cursor: isDeleting ? "not-allowed" : "pointer",
              transition: "background 150ms",
            }}
          >
            <Trash2 size={14} />
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function ListingShowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { data: listing, isLoading, isError, error } = useListing(id);
  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing();

  const isOwner = isAuthenticated && idEquals(user?.id, listing?.owner?._id);

  const handleDelete = () => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    deleteListing(id, {
      onSuccess: () => navigate("/listings", { replace: true }),
    });
  };

  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "32px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 32,
        }}
      >
        <div>
          <Skeleton variant="text" width="60%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={28} sx={{ mb: 3 }} />
          <Skeleton
            variant="rectangular"
            height={460}
            sx={{ borderRadius: 4, mb: 4 }}
          />
          <Skeleton variant="text" width="80%" height={28} />
          <Skeleton variant="text" width="90%" height={28} />
          <Skeleton variant="text" width="70%" height={28} />
        </div>
        <div>
          <Skeleton
            variant="rectangular"
            height={380}
            sx={{ borderRadius: 4 }}
          />
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div
        style={{
          maxWidth: 700,
          margin: "80px auto",
          padding: "40px",
          background: "#fee2e2",
          borderRadius: 20,
          textAlign: "center",
          color: "#b91c1c",
        }}
        role="alert"
      >
        <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>
          {error?.message || "Listing not found."}
        </p>
        <Link
          to="/listings"
          style={{
            display: "inline-block",
            marginTop: 16,
            color: "#b91c1c",
            textDecoration: "underline",
            fontWeight: 600,
          }}
        >
          ← Back to listings
        </Link>
      </div>
    );
  }

  const reviews = listing.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  /* Build a gallery from the single image (extend if the API provides more) */
  const galleryImages = listing.image?.url
    ? [
        listing.image.url,
        listing.image.url.replace("/upload", "/upload/e_viesus_correct"),
        listing.image.url.replace("/upload", "/upload/e_art:zorro"),
      ].filter(Boolean)
    : [];

  const amenities = AMENITIES_BY_CATEGORY[listing.category] || [
    "Wifi",
    "Kitchen",
  ];
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 6);

  return (
    <div
      style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 24px 64px" }}
    >
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              color: "#222",
              marginBottom: 8,
              lineHeight: 1.15,
            }}
          >
            {listing.title}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {avgRating > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "0.88rem",
                }}
              >
                <Star size={14} fill="#f59e0b" stroke="none" />
                <strong>{avgRating.toFixed(2)}</strong>
                <span style={{ color: "#717171" }}>·</span>
                <span style={{ textDecoration: "underline", color: "#555" }}>
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.88rem",
                color: "#555",
              }}
            >
              <MapPin size={14} />
              {listing.location}, {listing.country}
            </div>
            <Chip
              label={listing.category}
              size="small"
              sx={{
                background: "#fff0f1",
                color: "#cc2230",
                fontWeight: 600,
                fontSize: "0.72rem",
                border: "1px solid #ffadb1",
                borderRadius: "20px",
                height: 24,
              }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Tooltip title="Share listing">
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "transparent",
                border: "1.5px solid #e8e8e8",
                borderRadius: 24,
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#222",
                cursor: "pointer",
                transition: "background 150ms",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f9f9f9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Share2 size={15} />
              Share
            </button>
          </Tooltip>
          <Tooltip title={saved ? "Saved" : "Save to wishlist"}>
            <button
              onClick={() => setSaved((s) => !s)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "transparent",
                border: "1.5px solid #e8e8e8",
                borderRadius: 24,
                fontSize: "0.82rem",
                fontWeight: 600,
                color: saved ? "#fe424d" : "#222",
                cursor: "pointer",
                transition: "background 150ms",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f9f9f9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Heart size={15} fill={saved ? "#fe424d" : "none"} />
              Save
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ── Gallery ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <Gallery images={galleryImages} title={listing.title} />
      </div>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "32px 40px",
          alignItems: "start",
        }}
        className="show-grid"
      >
        {/* ── LEFT: Details ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {/* About section */}
          <div
            style={{
              paddingBottom: 32,
              borderBottom: "1px solid #f2f2f2",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #fe424d, #e5323d)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontFamily: '"DM Serif Display", Georgia, serif',
                  fontSize: "1.3rem",
                  flexShrink: 0,
                }}
              >
                {listing.owner?.username?.[0]?.toUpperCase() ?? "H"}
              </div>
              <div>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#222",
                    marginBottom: 2,
                  }}
                >
                  Hosted by {listing.owner?.username ?? "Your Host"}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { icon: <Shield size={13} />, label: "Superhost" },
                    { icon: <Clock size={13} />, label: "Fast replies" },
                  ].map(({ icon, label }) => (
                    <span
                      key={label}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.75rem",
                        color: "#717171",
                        background: "#f9f9f9",
                        padding: "3px 8px",
                        borderRadius: 8,
                        border: "1px solid #e8e8e8",
                      }}
                    >
                      {icon} {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "#3a3a3a",
              }}
            >
              {listing.description}
            </p>
          </div>

          {/* Quick stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              paddingBottom: 32,
              borderBottom: "1px solid #f2f2f2",
            }}
          >
            {[
              { icon: <Users size={20} />, label: "Guests", value: "Up to 6" },
              {
                icon: <Home size={20} />,
                label: "Type",
                value: listing.category,
              },
              {
                icon: <Globe size={20} />,
                label: "Country",
                value: listing.country,
              },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 18px",
                  background: "#f9f9f9",
                  borderRadius: 16,
                  border: "1px solid #f2f2f2",
                }}
              >
                <span style={{ color: "#fe424d", flexShrink: 0 }}>{icon}</span>
                <div>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#888",
                      marginBottom: 2,
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#222",
                      textTransform: "capitalize",
                    }}
                  >
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Amenities */}
          <div style={{ paddingBottom: 32, borderBottom: "1px solid #f2f2f2" }}>
            <h2
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: "1.4rem",
                color: "#222",
                marginBottom: 20,
              }}
            >
              What this place offers
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {amenities.map((a) => (
                <div
                  key={a}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    border: "1px solid #e8e8e8",
                    borderRadius: 14,
                    fontSize: "0.9rem",
                    color: "#222",
                  }}
                >
                  <span style={{ color: "#717171", flexShrink: 0 }}>
                    {AMENITY_ICONS[a] || <CheckCircle2 size={18} />}
                  </span>
                  {a}
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div style={{ paddingBottom: 32, borderBottom: "1px solid #f2f2f2" }}>
            <h2
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: "1.4rem",
                color: "#222",
                marginBottom: 16,
              }}
            >
              Where you'll be
            </h2>
            <p
              style={{
                fontSize: "0.88rem",
                color: "#717171",
                marginBottom: 16,
              }}
            >
              <MapPin size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
              {listing.location}, {listing.country}
            </p>
            <div
              className="listing-map"
              style={{
                height: 380,
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid #e8e8e8",
              }}
            >
              <ListingMap
                coordinates={listing.geometry?.coordinates}
                title={listing.title}
              />
            </div>
          </div>

          {/* Review stats */}
          {reviews.length > 0 && (
            <div
              style={{ paddingBottom: 32, borderBottom: "1px solid #f2f2f2" }}
            >
              <h2
                style={{
                  fontFamily: '"DM Serif Display", Georgia, serif',
                  fontSize: "1.4rem",
                  color: "#222",
                  marginBottom: 20,
                }}
              >
                Guest reviews
              </h2>
              <ReviewStats reviews={reviews} avgRating={avgRating} />
            </div>
          )}

          {/* Review cards */}
          <div>
            {/* Review form */}
            {isAuthenticated ? (
              <div style={{ marginBottom: 32 }}>
                <ReviewForm listingId={id} />
              </div>
            ) : (
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#717171",
                  marginBottom: 24,
                  padding: "16px 20px",
                  background: "#f9f9f9",
                  borderRadius: 14,
                  border: "1px solid #f2f2f2",
                }}
              >
                <Link
                  to="/login"
                  state={{ from: `/listings/${id}` }}
                  style={{
                    color: "#fe424d",
                    fontWeight: 600,
                    textDecoration: "underline",
                  }}
                >
                  Log in
                </Link>{" "}
                to leave a review.
              </p>
            )}

            {reviews.length > 0 && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  {visibleReviews.map((review) => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      listingId={id}
                    />
                  ))}
                </div>

                {reviews.length > 6 && (
                  <button
                    onClick={() => setShowAllReviews((s) => !s)}
                    style={{
                      marginTop: 20,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 24px",
                      border: "1.5px solid #222",
                      borderRadius: 12,
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      color: "#222",
                      background: "transparent",
                      cursor: "pointer",
                      transition: "background 150ms",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9f9f9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {showAllReviews
                      ? `Show fewer reviews`
                      : `Show all ${reviews.length} reviews`}
                    <ChevronDown
                      size={15}
                      style={{
                        transform: showAllReviews
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 200ms",
                      }}
                    />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Host profile — shown below reviews on narrow screens */}
          <div className="host-mobile">
            <HostProfile owner={listing.owner} createdAt={listing.createdAt} />
          </div>
        </div>

        {/* ── RIGHT: Sticky booking + host ───────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <BookingCard
            price={listing.price}
            avgRating={avgRating}
            reviewCount={reviews.length}
            isOwner={isOwner}
            listingId={id}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
          <HostProfile owner={listing.owner} createdAt={listing.createdAt} />
        </div>
      </div>

      {/* Responsive CSS overrides injected once */}
      <style>{`
        @media (max-width: 900px) {
          .show-grid {
            grid-template-columns: 1fr !important;
          }
          .host-mobile {
            display: block;
          }
        }
        @media (min-width: 901px) {
          .host-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
