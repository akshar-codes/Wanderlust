import { Trash2 } from "lucide-react";
import StarRating from "../common/StarRating";
import { useDeleteReview } from "../../hooks/useReviews";
import { useAuthStore } from "../../store/auth.store";

/** Safely compare two IDs that may be ObjectId or plain string */
function idEquals(a, b) {
  if (!a || !b) return false;
  return String(a) === String(b);
}

export default function ReviewCard({ review, listingId }) {
  const { user } = useAuthStore();
  const { mutate: deleteReview, isPending } = useDeleteReview(listingId);

  const isAuthor = idEquals(user?.id, review.author?._id);

  const handleDelete = () => {
    if (window.confirm("Delete your review?")) {
      deleteReview(review._id);
    }
  };

  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-card__author-wrap">
          <div className="review-card__avatar" aria-hidden>
            {review.author?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="review-card__author">
              @{review.author?.username ?? "unknown"}
            </p>
            <StarRating rating={review.rating} size={14} />
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="review-card__delete"
            aria-label="Delete your review"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <p className="review-card__comment">{review.comment}</p>

      {review.createdAt && (
        <time className="review-card__date" dateTime={review.createdAt}>
          {new Date(review.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
      )}
    </div>
  );
}
