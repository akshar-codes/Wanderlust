import { useState } from "react";
import {
  Trash2,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "../common/StarRating";
import {
  useDeleteReview,
  useUpsertHostReply,
  useDeleteHostReply,
  useToggleHelpful,
} from "../../hooks/useReviews";
import { useAuthStore } from "../../store/auth.store";

function idEquals(a, b) {
  if (!a || !b) return false;
  return String(a) === String(b);
}

// ── Tiny photo gallery ────────────────────────────────────────────────────────
function PhotoGallery({ photos }) {
  const [lightbox, setLightbox] = useState(null);

  if (!photos?.length) return null;

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 12,
        }}
      >
        {photos.map((photo, i) => (
          <button
            key={photo._id}
            onClick={() => setLightbox(i)}
            style={{
              width: 80,
              height: 80,
              borderRadius: 12,
              overflow: "hidden",
              border: "1.5px solid #ebe7e3",
              padding: 0,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <img
              src={photo.url}
              alt={photo.caption ?? `Review photo ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(20,13,8,0.88)",
              backdropFilter: "blur(10px)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: "relative", maxWidth: 900, width: "100%" }}
            >
              <img
                src={photos[lightbox].url}
                alt={photos[lightbox].caption ?? `Photo ${lightbox + 1}`}
                style={{
                  width: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  borderRadius: 20,
                  display: "block",
                }}
              />
              {photos[lightbox].caption && (
                <p
                  style={{
                    textAlign: "center",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.875rem",
                    marginTop: 12,
                  }}
                >
                  {photos[lightbox].caption}
                </p>
              )}
              {/* nav */}
              {photos.length > 1 && (
                <>
                  {lightbox > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightbox(lightbox - 1);
                      }}
                      style={{
                        position: "absolute",
                        left: -52,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#fff",
                        fontSize: "1.25rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ‹
                    </button>
                  )}
                  {lightbox < photos.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightbox(lightbox + 1);
                      }}
                      style={{
                        position: "absolute",
                        right: -52,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#fff",
                        fontSize: "1.25rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ›
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => setLightbox(null)}
                style={{
                  position: "absolute",
                  top: -48,
                  right: 0,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Host reply block ──────────────────────────────────────────────────────────
function HostReplyBlock({ reply, reviewId, listingId, isHost }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(reply?.text ?? "");
  const { mutate: upsert, isPending: saving } = useUpsertHostReply(listingId);
  const { mutate: del, isPending: deleting } = useDeleteHostReply(listingId);

  const save = () => {
    if (!text.trim()) return;
    upsert(
      { reviewId, text: text.trim() },
      { onSuccess: () => setEditing(false) },
    );
  };

  if (!reply && !isHost) return null;

  if (editing || (!reply && isHost)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginTop: 16,
          background: "#faf8f6",
          borderRadius: 14,
          border: "1.5px solid #ebe7e3",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 16px 0",
            fontSize: "0.8125rem",
            fontWeight: 700,
            color: "#261f1a",
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <span>🏠</span> Response from host
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          placeholder="Share how you responded or any context that helps future guests…"
          rows={3}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "none",
            background: "transparent",
            fontFamily: "inherit",
            fontSize: "0.875rem",
            color: "#3d3630",
            resize: "vertical",
            outline: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "8px 16px 14px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.72rem", color: "#b8b0a8" }}>
            {text.length}/1000
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                setEditing(false);
                setText(reply?.text ?? "");
              }}
              style={{
                padding: "7px 14px",
                border: "1.5px solid #d6d0ca",
                borderRadius: 999,
                background: "#fff",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#5c544c",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !text.trim()}
              style={{
                padding: "7px 16px",
                background: "linear-gradient(135deg, #ff5a5f, #e84040)",
                border: "none",
                borderRadius: 999,
                color: "#fff",
                fontSize: "0.8125rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                opacity: !text.trim() ? 0.5 : 1,
              }}
            >
              {saving ? "Saving…" : "Save response"}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!reply) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: 16,
        background: "#faf8f6",
        borderRadius: 14,
        border: "1.5px solid #ebe7e3",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "#261f1a",
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span>🏠</span> Response from host
          {reply.editedAt && (
            <span
              style={{ fontSize: "0.7rem", color: "#b8b0a8", fontWeight: 400 }}
            >
              (edited)
            </span>
          )}
        </span>
        {isHost && (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => {
                setText(reply.text);
                setEditing(true);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#8a8179",
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: "0.75rem",
                fontFamily: "inherit",
              }}
            >
              <Edit2 size={12} /> Edit
            </button>
            <button
              onClick={() => del(reviewId)}
              disabled={deleting}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: "0.75rem",
                fontFamily: "inherit",
              }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>
      <p
        style={{
          fontSize: "0.9rem",
          lineHeight: 1.65,
          color: "#3d3630",
          margin: 0,
        }}
      >
        {reply.text}
      </p>
      <p style={{ fontSize: "0.72rem", color: "#b8b0a8", marginTop: 6 }}>
        {new Date(reply.repliedAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </motion.div>
  );
}

// ── Main ReviewCard ───────────────────────────────────────────────────────────
export default function ReviewCard({ review, listingId, listingOwnerId }) {
  const { user } = useAuthStore();
  const [expanded, setExpanded] = useState(false);
  const { mutate: deleteReview, isPending: deleting } =
    useDeleteReview(listingId);
  const { mutate: toggleHelpful, isPending: voting } =
    useToggleHelpful(listingId);

  const isAuthor = idEquals(user?.id, review.author?._id);
  const isHost = idEquals(user?.id, listingOwnerId);
  const hasVoted = review.helpfulVoters?.some((v) => idEquals(v, user?.id));

  const TRUNCATE_AT = 280;
  const longComment = (review.comment?.length ?? 0) > TRUNCATE_AT;
  const displayComment =
    !expanded && longComment
      ? review.comment.slice(0, TRUNCATE_AT) + "…"
      : (review.comment ?? "");

  const CATEGORY_META = [
    { key: "cleanliness", label: "Cleanliness", icon: "🧹" },
    { key: "accuracy", label: "Accuracy", icon: "📍" },
    { key: "checkIn", label: "Check-in", icon: "🔑" },
    { key: "communication", label: "Communication", icon: "💬" },
    { key: "location", label: "Location", icon: "🗺️" },
    { key: "value", label: "Value", icon: "💰" },
  ];

  const hasCategoryRatings =
    review.categoryRatings &&
    Object.values(review.categoryRatings).some((v) => v != null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      style={{
        background: "#fff",
        border: "1px solid #ebe7e3",
        borderRadius: 20,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
        }}
      >
        {/* Author */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ffe1dc, #ffc1b8)",
              color: "#cc2828",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "1rem",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {review.author?.avatar ? (
              <img
                src={review.author.avatar}
                alt={review.author.username}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              (
                review.author?.firstName?.[0] ??
                review.author?.username?.[0] ??
                "?"
              ).toUpperCase()
            )}
          </div>
          <div>
            <p
              style={{
                fontWeight: 700,
                fontSize: "0.9375rem",
                color: "#261f1a",
                margin: 0,
              }}
            >
              {review.author?.firstName
                ? `${review.author.firstName}${review.author.lastName ? " " + review.author.lastName : ""}`
                : `@${review.author?.username ?? "guest"}`}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 3,
              }}
            >
              <StarRating rating={review.rating} size={13} />
              {review.createdAt && (
                <time
                  style={{ fontSize: "0.75rem", color: "#b8b0a8" }}
                  dateTime={review.createdAt}
                >
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              )}
              {review.updatedAt && (
                <span style={{ fontSize: "0.7rem", color: "#b8b0a8" }}>
                  (edited)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Delete (author only) */}
        {isAuthor && (
          <button
            onClick={() =>
              window.confirm("Delete your review?") && deleteReview(review._id)
            }
            disabled={deleting}
            aria-label="Delete your review"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "none",
              border: "1px solid #ebe7e3",
              cursor: "pointer",
              color: "#b8b0a8",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fef2f2";
              e.currentTarget.style.borderColor = "#fca5a5";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.borderColor = "#ebe7e3";
              e.currentTarget.style.color = "#b8b0a8";
            }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Category ratings (condensed) */}
      {hasCategoryRatings && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {CATEGORY_META.map(({ key, label, icon }) => {
            const val = review.categoryRatings?.[key];
            if (!val) return null;
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  background: "#faf8f6",
                  border: "1px solid #ebe7e3",
                  borderRadius: 999,
                  fontSize: "0.75rem",
                  color: "#5c544c",
                  fontWeight: 500,
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
                <span style={{ fontWeight: 700, color: "#261f1a" }}>
                  {val.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Comment */}
      {review.comment && (
        <div style={{ marginBottom: review.photos?.length ? 0 : 12 }}>
          <p
            style={{
              fontSize: "0.9375rem",
              lineHeight: 1.7,
              color: "#3d3630",
              margin: 0,
            }}
          >
            {displayComment}
          </p>
          {longComment && (
            <button
              onClick={() => setExpanded((e) => !e)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#261f1a",
                fontFamily: "inherit",
                padding: 0,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              {expanded ? (
                <>
                  <ChevronUp size={14} /> Show less
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> Show more
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Photos */}
      <PhotoGallery photos={review.photos} />

      {/* Footer: helpful vote */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 16,
          paddingTop: 12,
          borderTop: "1px solid #f4f1ee",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "#b8b0a8" }}>
          {review.helpfulVotes > 0
            ? `${review.helpfulVotes} ${review.helpfulVotes === 1 ? "person" : "people"} found this helpful`
            : "Was this helpful?"}
        </span>
        {user && !isAuthor && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleHelpful(review._id)}
            disabled={voting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px",
              borderRadius: 999,
              border: `1.5px solid ${hasVoted ? "rgba(255,90,95,0.4)" : "#d6d0ca"}`,
              background: hasVoted ? "rgba(255,90,95,0.06)" : "transparent",
              color: hasVoted ? "#ff5a5f" : "#5c544c",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            <ThumbsUp size={13} fill={hasVoted ? "#ff5a5f" : "none"} />
            {hasVoted ? "Helpful" : "Helpful"}
          </motion.button>
        )}
      </div>

      {/* Host reply */}
      <HostReplyBlock
        reply={review.hostReply}
        reviewId={review._id}
        listingId={listingId}
        isHost={isHost}
      />
    </motion.div>
  );
}
