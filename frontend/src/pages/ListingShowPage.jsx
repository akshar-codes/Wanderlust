import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  Skeleton as MuiSkeleton,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  Heart,
  Share2,
  Star,
  MapPin,
  Users,
  BedDouble,
  Bath,
  ChevronLeft,
  ChevronRight,
  X,
  Wifi,
  Waves,
  Car,
  UtensilsCrossed,
  Flame,
  Wind,
  Tv,
  Dumbbell,
  Dog,
  Mountain,
  TreePine,
  Shield,
  Award,
  Check,
  Home,
  CalendarDays,
  MessageSquare,
  ArrowLeft,
  Maximize2,
  Copy,
  Twitter,
  Facebook,
  Loader2,
} from "lucide-react";
import { useListing } from "../hooks/useListings";
import { useListings } from "../hooks/useListings";
import { useAuthStore } from "../store/auth.store";
import ListingMap from "../components/map/ListingMap";
import BookingWidget from "../components/booking/BookingWidget";
import { reviewsService } from "../services/reviews.service";
import { useCreateReview, useDeleteReview } from "../hooks/useReviews";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema } from "../schemas";
import toast from "react-hot-toast";

// ─── Amenity icon map ─────────────────────────────────────────────────────────
const AMENITY_ICONS = {
  wifi: { icon: <Wifi size={18} />, label: "Wifi" },
  pool: { icon: <Waves size={18} />, label: "Pool" },
  free_parking: { icon: <Car size={18} />, label: "Free parking" },
  paid_parking: { icon: <Car size={18} />, label: "Parking" },
  kitchen: { icon: <UtensilsCrossed size={18} />, label: "Kitchen" },
  fireplace: { icon: <Flame size={18} />, label: "Fireplace" },
  fire_pit: { icon: <Flame size={18} />, label: "Fire pit" },
  air_conditioning: { icon: <Wind size={18} />, label: "Air conditioning" },
  heating: { icon: <Flame size={18} />, label: "Heating" },
  tv: { icon: <Tv size={18} />, label: "TV" },
  gym: { icon: <Dumbbell size={18} />, label: "Gym" },
  pets_allowed: { icon: <Dog size={18} />, label: "Pets allowed" },
  mountain_view: { icon: <Mountain size={18} />, label: "Mountain view" },
  garden: { icon: <TreePine size={18} />, label: "Garden" },
  smoke_alarm: { icon: <Shield size={18} />, label: "Smoke alarm" },
  hot_tub: { icon: <Waves size={18} />, label: "Hot tub" },
  bbq_grill: { icon: <Flame size={18} />, label: "BBQ grill" },
  beach_access: { icon: <Waves size={18} />, label: "Beach access" },
  ocean_view: { icon: <Waves size={18} />, label: "Ocean view" },
  dedicated_workspace: { icon: <Home size={18} />, label: "Workspace" },
  washer: { icon: <Home size={18} />, label: "Washer" },
  dryer: { icon: <Home size={18} />, label: "Dryer" },
  elevator: { icon: <Home size={18} />, label: "Elevator" },
  breakfast: { icon: <UtensilsCrossed size={18} />, label: "Breakfast" },
  ski_in_ski_out: { icon: <Mountain size={18} />, label: "Ski-in/Ski-out" },
  lake_access: { icon: <Waves size={18} />, label: "Lake access" },
};

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function idEquals(a, b) {
  if (!a || !b) return false;
  return String(a) === String(b);
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(14,9,5,0.96)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* Close */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          border: "1.5px solid rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1,
        }}
      >
        <X size={20} color="#fff" />
      </motion.button>

      {/* Counter */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.6)",
          fontSize: "0.8125rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
        }}
      >
        {index + 1} / {images.length}
      </div>

      {/* Image */}
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={images[index]?.url}
          alt={`Photo ${index + 1}`}
          style={{
            maxWidth: "90vw",
            maxHeight: "80vh",
            objectFit: "contain",
            borderRadius: 12,
          }}
        />
      </motion.div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            style={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.14)",
              border: "1.5px solid rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={22} color="#fff" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            style={{
              position: "absolute",
              right: 20,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.14)",
              border: "1.5px solid rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronRight size={22} color="#fff" />
          </motion.button>
        </>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
          }}
        >
          {images.map((img, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.06 }}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              style={{
                width: 52,
                height: 36,
                borderRadius: 6,
                overflow: "hidden",
                cursor: "pointer",
                border:
                  i === index
                    ? "2px solid #ff5a5f"
                    : "2px solid rgba(255,255,255,0.2)",
                padding: 0,
                background: "none",
                opacity: i === index ? 1 : 0.55,
                transition: "all 0.15s",
              }}
            >
              <img
                src={img.url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Share sheet ──────────────────────────────────────────────────────────────
function ShareSheet({ open, onClose, listing }) {
  const url = window.location.href;
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  const socials = [
    {
      label: "Twitter / X",
      icon: <Twitter size={16} />,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(listing?.title || "")}&url=${encodeURIComponent(url)}`,
      bg: "#000",
    },
    {
      label: "Facebook",
      icon: <Facebook size={16} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      bg: "#1877F2",
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 8000,
            background: "rgba(14,9,5,0.5)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#fff",
              borderRadius: "24px 24px 0 0",
              padding: "28px 28px 36px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "1.3rem",
                  color: "#261f1a",
                  margin: 0,
                }}
              >
                Share this listing
              </h3>
              <button
                onClick={onClose}
                style={{
                  background: "#f4f1ee",
                  border: "none",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={15} color="#5c544c" />
              </button>
            </div>

            {/* Preview */}
            <div
              style={{
                display: "flex",
                gap: 12,
                padding: "12px",
                background: "#faf8f6",
                borderRadius: 12,
                marginBottom: 20,
                border: "1px solid #ebe7e3",
              }}
            >
              <img
                src={listing?.image?.url}
                alt=""
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#261f1a",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {listing?.title}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#8a8179",
                    margin: "3px 0 0",
                  }}
                >
                  {listing?.location}, {listing?.country}
                </p>
              </div>
            </div>

            {/* Socials */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px",
                    borderRadius: 10,
                    textDecoration: "none",
                    background: s.bg,
                    color: "#fff",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                  }}
                >
                  {s.icon} {s.label}
                </a>
              ))}
            </div>

            {/* Copy link */}
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  background: "#f4f1ee",
                  border: "1.5px solid #ebe7e3",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: "0.8125rem",
                  color: "#8a8179",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {url}
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={copyLink}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: copied ? "#10b981" : "#261f1a",
                  border: "none",
                  color: "#fff",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Star Picker (inline) ─────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 2,
          }}
        >
          <svg
            width={26}
            height={26}
            viewBox="0 0 24 24"
            fill={star <= value ? "#f59e0b" : "none"}
            stroke={star <= value ? "#f59e0b" : "#9ca3af"}
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ─── Review Form ──────────────────────────────────────────────────────────────
function ReviewForm({ listingId }) {
  const { mutate: createReview, isPending } = useCreateReview(listingId);
  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const onSubmit = (data) => {
    if (rating < 1) {
      setRatingError("Please choose a star rating");
      return;
    }
    setRatingError("");
    createReview(
      { ...data, rating },
      {
        onSuccess: () => {
          reset();
          setRating(0);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#261f1a",
            marginBottom: 8,
          }}
        >
          Your rating
        </label>
        <StarPicker
          value={rating}
          onChange={(v) => {
            setRating(v);
            if (v > 0) setRatingError("");
          }}
        />
        {ratingError && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "#ef4444",
              margin: "6px 0 0",
            }}
          >
            {ratingError}
          </p>
        )}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="review-comment"
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#261f1a",
            marginBottom: 8,
          }}
        >
          Your review
        </label>
        <textarea
          id="review-comment"
          rows={4}
          placeholder="Share your experience at this property…"
          style={{
            width: "100%",
            padding: "12px 14px",
            boxSizing: "border-box",
            border: `1.5px solid ${errors.comment ? "#ef4444" : "#d6d0ca"}`,
            borderRadius: 12,
            fontSize: "0.9375rem",
            fontFamily: "inherit",
            color: "#261f1a",
            background: "#fff",
            outline: "none",
            resize: "vertical",
            transition: "border-color 0.15s",
          }}
          {...register("comment")}
        />
        {errors.comment && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "#ef4444",
              margin: "4px 0 0",
            }}
          >
            {errors.comment.message}
          </p>
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isPending}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 24px",
          background: "linear-gradient(135deg, #ff5a5f, #e84040)",
          border: "none",
          borderRadius: 999,
          color: "#fff",
          fontSize: "0.9rem",
          fontWeight: 700,
          cursor: isPending ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          opacity: isPending ? 0.75 : 1,
        }}
      >
        {isPending ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Submitting…
          </>
        ) : (
          "Submit review"
        )}
      </motion.button>
    </form>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({ review, listingId }) {
  const { user } = useAuthStore();
  const { mutate: deleteReview, isPending } = useDeleteReview(listingId);
  const isAuthor = idEquals(user?.id, review.author?._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#fff",
        border: "1px solid #ebe7e3",
        borderRadius: 16,
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ffe1dc, #ffc1b8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.9375rem",
              color: "#cc2828",
              flexShrink: 0,
            }}
          >
            {review.author?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p
              style={{
                fontWeight: 700,
                fontSize: "0.875rem",
                color: "#261f1a",
                margin: 0,
              }}
            >
              @{review.author?.username ?? "unknown"}
            </p>
            <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  width={13}
                  height={13}
                  viewBox="0 0 24 24"
                  fill={s <= review.rating ? "#f59e0b" : "none"}
                  stroke={s <= review.rating ? "#f59e0b" : "#d1d5db"}
                  strokeWidth="1.5"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {review.createdAt && (
            <time style={{ fontSize: "0.75rem", color: "#b8b0a8" }}>
              {formatDate(review.createdAt)}
            </time>
          )}
          {isAuthor && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              onClick={() => {
                if (window.confirm("Delete your review?"))
                  deleteReview(review._id);
              }}
              disabled={isPending}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#b8b0a8",
                padding: 4,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Delete review"
            >
              <X size={14} />
            </motion.button>
          )}
        </div>
      </div>
      <p
        style={{
          fontSize: "0.9375rem",
          lineHeight: 1.65,
          color: "#3d3630",
          margin: 0,
        }}
      >
        {review.comment}
      </p>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ShowPageSkeleton() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingTop: 24 }}>
      <MuiSkeleton
        variant="rounded"
        height={480}
        sx={{ borderRadius: "20px", mb: 3 }}
      />
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <MuiSkeleton variant="text" width="60%" height={40} />
          <MuiSkeleton variant="text" width="40%" height={22} />
          <MuiSkeleton
            variant="rounded"
            height={120}
            sx={{ borderRadius: "12px" }}
          />
          <MuiSkeleton
            variant="rounded"
            height={200}
            sx={{ borderRadius: "12px" }}
          />
        </div>
        <MuiSkeleton
          variant="rounded"
          height={380}
          sx={{ borderRadius: "20px" }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ListingShowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: listing, isLoading, isError } = useListing(id);
  const { data: allListingsData } = useListings({
    limit: 6,
    category: listing?.category,
  });

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const bookingRef = useRef(null);
  const headerRef = useRef(null);

  if (isLoading) return <ShowPageSkeleton />;

  if (isError || !listing) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: 16,
        }}
      >
        <div style={{ fontSize: "3rem" }}>🏚️</div>
        <h2
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            color: "#261f1a",
          }}
        >
          Listing not found
        </h2>
        <button
          onClick={() => navigate("/listings")}
          style={{
            padding: "10px 24px",
            background: "#ff5a5f",
            border: "none",
            borderRadius: 999,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Browse all listings
        </button>
      </div>
    );
  }

  // Images: combine images[] with legacy image{}
  const images = listing.images?.length
    ? listing.images
    : listing.image?.url
      ? [{ url: listing.image.url, filename: listing.image.filename }]
      : [];

  const reviews = listing.reviews ?? [];
  const amenities = listing.amenities ?? [];
  const similarListings = (allListingsData?.listings ?? [])
    .filter((l) => l._id !== id)
    .slice(0, 4);

  // Rating distribution (simulated from review data)
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }));

  const avgRating = listing.averageRating ?? 0;
  const reviewCount = listing.reviewCount ?? reviews.length ?? 0;

  return (
    <>
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={images}
            startIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        listing={listing}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ paddingTop: 8, paddingBottom: 80 }}
      >
        {/* ── Back nav ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <motion.button
            whileHover={{ x: -3 }}
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#5c544c",
              fontFamily: "inherit",
              padding: 0,
            }}
          >
            <ArrowLeft size={16} /> Back to listings
          </motion.button>
        </div>

        {/* ── Title + actions ────────────────────────────────────────── */}
        <div ref={headerRef} style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    background: "rgba(255,90,95,0.1)",
                    color: "#e84040",
                    borderRadius: 999,
                    padding: "3px 10px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {CATEGORY_ICONS[listing.category] ?? "🏠"} {listing.category}
                </span>
                {listing.featured && (
                  <span
                    style={{
                      background: "linear-gradient(135deg, #ff5a5f, #e84040)",
                      color: "#fff",
                      borderRadius: 999,
                      padding: "3px 10px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Award size={10} /> Featured
                  </span>
                )}
              </div>
              <h1
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 400,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "#261f1a",
                  margin: 0,
                  maxWidth: 700,
                }}
              >
                {listing.title}
              </h1>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 10,
                }}
              >
                {avgRating > 0 && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Star size={14} fill="#f59e0b" stroke="none" />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "#261f1a",
                      }}
                    >
                      {Number(avgRating).toFixed(1)}
                    </span>
                    <span style={{ fontSize: "0.875rem", color: "#8a8179" }}>
                      · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={13} color="#b8b0a8" />
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "#5c544c",
                      fontWeight: 500,
                    }}
                  >
                    {listing.location}, {listing.country}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Tooltip title="Share listing" placement="top">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setShareOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    border: "1.5px solid #d6d0ca",
                    borderRadius: 999,
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#3d3630",
                    fontFamily: "inherit",
                  }}
                >
                  <Share2 size={15} /> Share
                </motion.button>
              </Tooltip>
              <Tooltip
                title={wishlisted ? "Saved" : "Save to wishlist"}
                placement="top"
              >
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    setWishlisted((w) => !w);
                    toast(
                      wishlisted
                        ? "Removed from wishlist"
                        : "Saved to wishlist",
                      { icon: wishlisted ? "💔" : "❤️" },
                    );
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    border: `1.5px solid ${wishlisted ? "rgba(255,90,95,0.4)" : "#d6d0ca"}`,
                    borderRadius: 999,
                    background: wishlisted ? "rgba(255,90,95,0.06)" : "#fff",
                    cursor: "pointer",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: wishlisted ? "#ff5a5f" : "#3d3630",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  <motion.div
                    animate={{ scale: wishlisted ? [1, 1.4, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      size={15}
                      fill={wishlisted ? "#ff5a5f" : "none"}
                      stroke={wishlisted ? "#ff5a5f" : "currentColor"}
                    />
                  </motion.div>
                  {wishlisted ? "Saved" : "Save"}
                </motion.button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* ── Gallery ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 40, position: "relative" }}>
          {images.length === 0 ? (
            <div
              style={{
                width: "100%",
                height: 420,
                borderRadius: 20,
                background: "linear-gradient(135deg, #f4f1ee, #ebe7e3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#b8b0a8",
                fontSize: "3rem",
              }}
            >
              🏠
            </div>
          ) : images.length === 1 ? (
            <div
              style={{
                position: "relative",
                borderRadius: 20,
                overflow: "hidden",
                cursor: "zoom-in",
              }}
              onClick={() => {
                setLightboxIndex(0);
                setLightboxOpen(true);
              }}
            >
              <img
                src={images[0].url}
                alt={listing.title}
                style={{
                  width: "100%",
                  height: 480,
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: images.length >= 3 ? "1fr 1fr" : "1fr",
                gap: 8,
                height: 480,
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              {/* Hero image */}
              <div
                style={{
                  gridRow: "1 / 3",
                  position: "relative",
                  cursor: "zoom-in",
                  overflow: "hidden",
                }}
                onClick={() => {
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
              >
                <motion.img
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                  src={images[0].url}
                  alt={listing.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
              {/* Secondary images */}
              {images.slice(1, 5).map((img, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    cursor: "zoom-in",
                    overflow: "hidden",
                  }}
                  onClick={() => {
                    setLightboxIndex(i + 1);
                    setLightboxOpen(true);
                  }}
                >
                  <motion.img
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.4 }}
                    src={img.url}
                    alt={`Photo ${i + 2}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {/* Last tile overlay when more images */}
                  {i === 3 && images.length > 5 && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(14,9,5,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "1.125rem",
                        }}
                      >
                        +{images.length - 5} more
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Show all photos button */}
          {images.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setLightboxIndex(0);
                setLightboxOpen(true);
              }}
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)",
                border: "1.5px solid rgba(230,224,218,0.8)",
                borderRadius: 999,
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: "#261f1a",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
              }}
            >
              <Maximize2 size={13} /> Show all {images.length} photos
            </motion.button>
          )}
        </div>

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "0 48px",
            alignItems: "start",
          }}
          className="show-layout"
        >
          {/* ── LEFT COLUMN ────────────────────────────────────────── */}
          <div style={{ minWidth: 0 }}>
            {/* Property stats row */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                padding: "20px 0",
                borderBottom: "1px solid #ebe7e3",
                marginBottom: 32,
              }}
            >
              {[
                {
                  icon: <Users size={17} />,
                  label: `${listing.maxGuests ?? 2} guests`,
                },
                {
                  icon: <BedDouble size={17} />,
                  label: `${listing.bedrooms ?? 1} ${(listing.bedrooms ?? 1) === 1 ? "bedroom" : "bedrooms"}`,
                },
                {
                  icon: <Home size={17} />,
                  label: `${listing.beds ?? 1} ${(listing.beds ?? 1) === 1 ? "bed" : "beds"}`,
                },
                {
                  icon: <Bath size={17} />,
                  label: `${listing.bathrooms ?? 1} ${(listing.bathrooms ?? 1) === 1 ? "bath" : "baths"}`,
                },
                listing.minimumStay > 1 && {
                  icon: <CalendarDays size={17} />,
                  label: `${listing.minimumStay} night min`,
                },
              ]
                .filter(Boolean)
                .map(({ icon, label }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "8px 14px",
                      background: "#faf8f6",
                      border: "1px solid #ebe7e3",
                      borderRadius: 10,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#3d3630",
                    }}
                  >
                    <span style={{ color: "#ff5a5f" }}>{icon}</span>
                    {label}
                  </div>
                ))}
            </div>

            {/* ── Host info ──────────────────────────────────────────── */}
            {listing.owner && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "22px 24px",
                  background: "linear-gradient(135deg, #faf8f6, #fff)",
                  border: "1px solid #ebe7e3",
                  borderRadius: 18,
                  marginBottom: 36,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ position: "relative" }}>
                    <Avatar
                      src={listing.owner.avatar?.url ?? listing.owner.avatar}
                      sx={{
                        width: 52,
                        height: 52,
                        background: "linear-gradient(135deg, #FF5A5F, #e84040)",
                        fontWeight: 700,
                        fontSize: "1.125rem",
                      }}
                    >
                      {listing.owner.username?.[0]?.toUpperCase() ?? "H"}
                    </Avatar>
                    {listing.owner.emailVerified && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: -2,
                          right: -2,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#10b981",
                          border: "2px solid #fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={10} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#b8b0a8",
                      }}
                    >
                      Hosted by
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "#261f1a",
                      }}
                    >
                      {listing.owner.firstName
                        ? `${listing.owner.firstName} ${listing.owner.lastName ?? ""}`.trim()
                        : listing.owner.username}
                    </p>
                    {listing.owner.bio && (
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "0.8125rem",
                          color: "#8a8179",
                          lineHeight: 1.5,
                          maxWidth: 400,
                        }}
                      >
                        {listing.owner.bio}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  {[
                    listing.owner.emailVerified && {
                      icon: <Shield size={13} />,
                      text: "Verified host",
                    },
                    {
                      icon: <MessageSquare size={13} />,
                      text: "Fast responder",
                    },
                  ]
                    .filter(Boolean)
                    .map(({ icon, text }) => (
                      <div
                        key={text}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.75rem",
                          color: "#5c544c",
                          fontWeight: 500,
                        }}
                      >
                        <span style={{ color: "#10b981" }}>{icon}</span> {text}
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* ── Description ─────────────────────────────────────────── */}
            <div style={{ marginBottom: 36 }}>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "1.5rem",
                  color: "#261f1a",
                  marginBottom: 14,
                }}
              >
                About this place
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  color: "#5c544c",
                  margin: 0,
                }}
              >
                {listing.description}
              </p>
            </div>

            {/* ── Amenities ──────────────────────────────────────────── */}
            {amenities.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: "1.5rem",
                    color: "#261f1a",
                    marginBottom: 20,
                  }}
                >
                  What this place offers
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 10,
                  }}
                >
                  {(showAllAmenities ? amenities : amenities.slice(0, 10)).map(
                    (key) => {
                      const meta = AMENITY_ICONS[key];
                      const label =
                        meta?.label ??
                        key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "12px 14px",
                            border: "1px solid #ebe7e3",
                            borderRadius: 12,
                            fontSize: "0.875rem",
                            color: "#3d3630",
                            fontWeight: 500,
                            background: "#faf8f6",
                          }}
                        >
                          <span style={{ color: "#8a8179", flexShrink: 0 }}>
                            {meta?.icon ?? <Check size={18} />}
                          </span>
                          {label}
                        </div>
                      );
                    },
                  )}
                </div>
                {amenities.length > 10 && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setShowAllAmenities((s) => !s)}
                    style={{
                      marginTop: 14,
                      padding: "10px 20px",
                      border: "1.5px solid #d6d0ca",
                      borderRadius: 999,
                      background: "#fff",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#3d3630",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {showAllAmenities
                      ? "Show fewer amenities"
                      : `Show all ${amenities.length} amenities`}
                  </motion.button>
                )}
              </div>
            )}

            {/* ── House rules ────────────────────────────────────────── */}
            {listing.houseRules && (
              <div style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: "1.5rem",
                    color: "#261f1a",
                    marginBottom: 16,
                  }}
                >
                  House rules
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 10,
                  }}
                >
                  {[
                    listing.houseRules.checkInTime && {
                      label: "Check-in",
                      value: listing.houseRules.checkInTime,
                    },
                    listing.houseRules.checkOutTime && {
                      label: "Checkout",
                      value: listing.houseRules.checkOutTime,
                    },
                    {
                      label: "Smoking",
                      value: listing.houseRules.smokingAllowed
                        ? "Allowed"
                        : "Not allowed",
                    },
                    {
                      label: "Pets",
                      value: listing.houseRules.petsAllowed
                        ? "Allowed"
                        : "Not allowed",
                    },
                    {
                      label: "Parties",
                      value: listing.houseRules.partiesAllowed
                        ? "Allowed"
                        : "Not allowed",
                    },
                    listing.houseRules.quietHoursStart && {
                      label: "Quiet hours",
                      value: `${listing.houseRules.quietHoursStart}–${listing.houseRules.quietHoursEnd}`,
                    },
                  ]
                    .filter(Boolean)
                    .map(({ label, value }) => (
                      <div
                        key={label}
                        style={{
                          padding: "12px 14px",
                          background: "#faf8f6",
                          border: "1px solid #ebe7e3",
                          borderRadius: 12,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            color: "#b8b0a8",
                          }}
                        >
                          {label}
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#3d3630",
                          }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                </div>
                {listing.houseRules.additionalRules?.length > 0 && (
                  <ul
                    style={{
                      marginTop: 14,
                      paddingLeft: 18,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {listing.houseRules.additionalRules.map((rule, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: "0.875rem",
                          color: "#5c544c",
                          lineHeight: 1.6,
                        }}
                      >
                        {rule}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ── Reviews ─────────────────────────────────────────────── */}
            <div style={{ marginBottom: 40 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <h2
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: "1.5rem",
                    color: "#261f1a",
                    margin: 0,
                  }}
                >
                  Reviews
                </h2>
                {reviewCount > 0 && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <Star size={16} fill="#f59e0b" stroke="none" />
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "#261f1a",
                      }}
                    >
                      {Number(avgRating).toFixed(1)}
                    </span>
                    <span style={{ color: "#8a8179", fontSize: "0.875rem" }}>
                      · {reviewCount} reviews
                    </span>
                  </div>
                )}
              </div>

              {/* Rating breakdown */}
              {reviewCount > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px 24px",
                    marginBottom: 28,
                    padding: "20px",
                    background: "#faf8f6",
                    border: "1px solid #ebe7e3",
                    borderRadius: 16,
                  }}
                >
                  {ratingCounts.map(({ stars, count }) => (
                    <div
                      key={stars}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: "#5c544c",
                          minWidth: 14,
                          textAlign: "right",
                        }}
                      >
                        {stars}
                      </span>
                      <Star
                        size={12}
                        fill="#f59e0b"
                        stroke="none"
                        style={{ flexShrink: 0 }}
                      />
                      <div
                        style={{
                          flex: 1,
                          height: 4,
                          background: "#e5e0d8",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width:
                              reviewCount > 0
                                ? `${(count / reviewCount) * 100}%`
                                : "0%",
                          }}
                          transition={{
                            delay: 0.2,
                            duration: 0.6,
                            ease: "easeOut",
                          }}
                          style={{
                            height: "100%",
                            background: "#261f1a",
                            borderRadius: 2,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#b8b0a8",
                          minWidth: 20,
                        }}
                      >
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Review list */}
              {reviews.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    marginBottom: 28,
                  }}
                >
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      listingId={id}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 24px",
                    background: "#faf8f6",
                    border: "1px dashed #d6d0ca",
                    borderRadius: 16,
                    marginBottom: 28,
                  }}
                >
                  <p style={{ fontSize: "1.5rem", marginBottom: 8 }}>💬</p>
                  <p
                    style={{
                      fontWeight: 700,
                      color: "#261f1a",
                      margin: "0 0 4px",
                    }}
                  >
                    No reviews yet
                  </p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#8a8179",
                      margin: 0,
                    }}
                  >
                    Be the first to share your experience.
                  </p>
                </div>
              )}

              {/* Leave a review */}
              {user && (
                <div
                  style={{
                    background: "#fff",
                    border: "1.5px solid #ebe7e3",
                    borderRadius: 18,
                    padding: "24px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'DM Serif Display', Georgia, serif",
                      fontSize: "1.2rem",
                      color: "#261f1a",
                      margin: "0 0 20px",
                    }}
                  >
                    Leave a review
                  </h3>
                  <ReviewForm listingId={id} />
                </div>
              )}
            </div>

            {/* ── Location ─────────────────────────────────────────────── */}
            <div style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "1.5rem",
                  color: "#261f1a",
                  marginBottom: 8,
                }}
              >
                Where you'll be
              </h2>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "#5c544c",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MapPin size={15} color="#ff5a5f" />
                {listing.location}, {listing.country}
              </p>
              <div
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "1px solid #ebe7e3",
                }}
              >
                <ListingMap
                  coordinates={listing.geometry?.coordinates}
                  title={listing.title}
                />
              </div>
            </div>

            {/* ── Similar listings ─────────────────────────────────────── */}
            {similarListings.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <h2
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: "1.5rem",
                    color: "#261f1a",
                    marginBottom: 20,
                  }}
                >
                  Similar stays
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 16,
                  }}
                >
                  {similarListings.map((similar, i) => {
                    const seed = similar._id
                      ? parseInt(similar._id.slice(-4), 16)
                      : i;
                    const rating =
                      similar.averageRating ??
                      (4.2 + (seed % 8) * 0.1).toFixed(1);
                    return (
                      <motion.div
                        key={similar._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ y: -3 }}
                      >
                        <Link
                          to={`/listings/${similar._id}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <div
                            style={{
                              borderRadius: 16,
                              overflow: "hidden",
                              aspectRatio: "4/3",
                              background: "#f4f1ee",
                              marginBottom: 10,
                            }}
                          >
                            <img
                              src={similar.image?.url}
                              alt={similar.title}
                              loading="lazy"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                transition: "transform 0.4s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                  "scale(1.05)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                              }
                            />
                          </div>
                          <h4
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: 700,
                              color: "#261f1a",
                              margin: "0 0 4px",
                              lineHeight: 1.3,
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {similar.title}
                          </h4>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#8a8179",
                              margin: "0 0 4px",
                            }}
                          >
                            {similar.location}, {similar.country}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                color: "#261f1a",
                              }}
                            >
                              ₹{Number(similar.price).toLocaleString("en-IN")}
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "#8a8179",
                                  fontSize: "0.8rem",
                                }}
                              >
                                /night
                              </span>
                            </span>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <Star size={11} fill="#f59e0b" stroke="none" />
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  fontWeight: 600,
                                  color: "#3d3630",
                                }}
                              >
                                {Number(rating).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 20, textAlign: "center" }}>
                  <Link
                    to={`/listings?category=${listing.category}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 24px",
                      border: "1.5px solid #d6d0ca",
                      borderRadius: 999,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#3d3630",
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                  >
                    Show more {listing.category} listings →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — Sticky booking card ─────────────────── */}
          <div>
            <BookingWidget listing={listing} />

            {listing.minimumStay > 1 && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.8125rem",
                  color: "#b8b0a8",
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <CalendarDays size={13} />
                Minimum {listing.minimumStay}-night stay
                {listing.maximumStay
                  ? ` · Max ${listing.maximumStay} nights`
                  : ""}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 900px) {
          .show-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
