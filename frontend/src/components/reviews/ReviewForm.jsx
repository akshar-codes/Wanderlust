import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ImagePlus, X } from "lucide-react";
import { reviewSchema } from "../../schemas";
import { StarPicker, CategoryStarPicker } from "../common/StarRating";
import { useCreateReview, useAddReviewPhotos } from "../../hooks/useReviews";

const CATEGORIES = [
  { key: "cleanliness", label: "Cleanliness", icon: "🧹" },
  { key: "accuracy", label: "Accuracy", icon: "📍" },
  { key: "checkIn", label: "Check-in", icon: "🔑" },
  { key: "communication", label: "Communication", icon: "💬" },
  { key: "location", label: "Location", icon: "🗺️" },
  { key: "value", label: "Value", icon: "💰" },
];

const MAX_PHOTOS = 5;

export default function ReviewForm({ listingId }) {
  const { mutate: createReview, isPending } = useCreateReview(listingId);
  const { mutate: addPhotos, isPending: uploadingPhotos } =
    useAddReviewPhotos(listingId);

  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [categoryRatings, setCategoryRatings] = useState({});
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const room = MAX_PHOTOS - photoFiles.length;
    const accepted = files.slice(0, room);

    setPhotoFiles((prev) => [...prev, ...accepted]);
    accepted.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setPhotoPreviews((prev) => [
          ...prev,
          { url: reader.result, name: file.name },
        ]);
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    if (rating < 1) {
      setRatingError("Please choose a star rating");
      return;
    }
    setRatingError("");

    const cleanCategoryRatings = Object.fromEntries(
      Object.entries(categoryRatings).filter(([, v]) => v > 0),
    );

    createReview(
      {
        ...data,
        rating,
        categoryRatings:
          Object.keys(cleanCategoryRatings).length > 0
            ? cleanCategoryRatings
            : undefined,
      },
      {
        onSuccess: (review) => {
          if (photoFiles.length > 0 && review?._id) {
            addPhotos({ reviewId: review._id, files: photoFiles });
          }
          reset();
          setRating(0);
          setCategoryRatings({});
          setPhotoFiles([]);
          setPhotoPreviews([]);
          setShowCategories(false);
        },
      },
    );
  };

  const submitting = isPending || uploadingPhotos;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="review-form" noValidate>
      <h3 className="review-form__heading">Leave a Review</h3>

      {/* ── Star picker ─────────────────────────────────────────────── */}
      <div className="form-group">
        <label className="form-label">Your Rating</label>
        <StarPicker
          value={rating}
          onChange={(val) => {
            setRating(val);
            if (val > 0) setRatingError("");
          }}
        />
        {ratingError && (
          <p className="form-error" role="alert">
            {ratingError}
          </p>
        )}
      </div>

      {/* ── Category ratings (collapsible) ─────────────────────────── */}
      <div className="form-group">
        <button
          type="button"
          onClick={() => setShowCategories((s) => !s)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#5c544c",
            fontSize: "0.8125rem",
            fontWeight: 600,
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          {showCategories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Rate specific categories (optional)
        </button>

        <AnimatePresence>
          {showCategories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  marginTop: 10,
                  padding: "4px 16px",
                  background: "#faf8f6",
                  borderRadius: 14,
                  border: "1px solid #ebe7e3",
                }}
              >
                {CATEGORIES.map(({ key, label, icon }, i) => (
                  <div key={key}>
                    <CategoryStarPicker
                      label={label}
                      icon={icon}
                      value={categoryRatings[key] ?? 0}
                      onChange={(v) =>
                        setCategoryRatings((prev) => ({ ...prev, [key]: v }))
                      }
                    />
                    {i < CATEGORIES.length - 1 && (
                      <div style={{ height: 1, background: "#ebe7e3" }} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Comment ─────────────────────────────────────────────────── */}
      <div className="form-group">
        <label className="form-label" htmlFor="review-comment">
          Comment
        </label>
        <textarea
          id="review-comment"
          rows={4}
          maxLength={2000}
          className={`form-textarea${errors.comment ? " form-input--error" : ""}`}
          placeholder="Share your experience…"
          {...register("comment")}
        />
        {errors.comment && (
          <p className="form-error" role="alert">
            {errors.comment.message}
          </p>
        )}
      </div>

      {/* ── Photo upload ────────────────────────────────────────────── */}
      <div className="form-group">
        <label className="form-label">Add photos (optional)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {photoPreviews.map((p, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                width: 76,
                height: 76,
                borderRadius: 12,
                overflow: "hidden",
                border: "1.5px solid #ebe7e3",
              }}
            >
              <img
                src={p.url}
                alt={p.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label="Remove photo"
                style={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "rgba(20,13,8,0.65)",
                  border: "none",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={11} />
              </button>
            </div>
          ))}

          {photoFiles.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 76,
                height: 76,
                borderRadius: 12,
                border: "1.5px dashed #d6d0ca",
                background: "#faf8f6",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                cursor: "pointer",
                color: "#8a8179",
                fontFamily: "inherit",
              }}
            >
              <ImagePlus size={18} />
              <span style={{ fontSize: "0.65rem", fontWeight: 600 }}>Add</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          multiple
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <p className="form-hint">Up to {MAX_PHOTOS} photos, JPG/PNG/WebP</p>
      </div>

      <button type="submit" className="btn btn--primary" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
