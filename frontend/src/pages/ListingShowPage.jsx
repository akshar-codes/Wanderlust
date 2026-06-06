import { useParams, useNavigate, Link } from "react-router-dom";
import { Pencil, Trash2, MapPin, Globe, User } from "lucide-react";
import { useListing, useDeleteListing } from "../hooks/useListings";
import { useAuthStore } from "../store/auth.store";
import StarRating from "../components/common/StarRating";
import ReviewCard from "../components/reviews/ReviewCard";
import ReviewForm from "../components/reviews/ReviewForm";
import ListingMap from "../components/map/ListingMap";
import Spinner from "../components/common/Spinner";

/** Safely compare two IDs that may be Mongoose ObjectId or plain string */
function idEquals(a, b) {
  if (!a || !b) return false;
  return String(a) === String(b);
}

export default function ListingShowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const { data: listing, isLoading, isError, error } = useListing(id);
  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing();

  if (isLoading) {
    return (
      <div className="center-screen">
        <Spinner size={42} />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="error-banner" role="alert">
        <p>{error?.message || "Listing not found."}</p>
      </div>
    );
  }

  const isOwner = isAuthenticated && idEquals(user?.id, listing.owner?._id);

  const handleDelete = () => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    deleteListing(id, {
      // Navigate only after the mutation succeeds — toast fires inside the hook
      onSuccess: () => navigate("/listings", { replace: true }),
    });
  };

  const reviews = listing.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="show-page">
      {/* ── Hero image ───────────────────────────────────────────────── */}
      <div className="show-hero">
        <img
          src={listing.image?.url}
          alt={listing.title}
          className="show-hero__img"
        />
        {avgRating > 0 && (
          <div className="show-hero__rating">
            <StarRating rating={Math.round(avgRating)} size={16} />
            <span className="show-hero__rating-text">
              {avgRating.toFixed(1)}&nbsp;·&nbsp;
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <div className="show-body">
        {/* ── Info ────────────────────────────────────────────────────── */}
        <div className="show-info">
          <h1 className="show-title">{listing.title}</h1>

          <div className="show-meta">
            <span className="show-meta__item">
              <User size={14} aria-hidden />
              Hosted by&nbsp;<strong>{listing.owner?.username ?? "—"}</strong>
            </span>
            <span className="show-meta__item">
              <MapPin size={14} aria-hidden />
              {listing.location}
            </span>
            <span className="show-meta__item">
              <Globe size={14} aria-hidden />
              {listing.country}
            </span>
          </div>

          <p className="show-description">{listing.description}</p>

          <p className="show-price">
            ₹{listing.price.toLocaleString("en-IN")}
            <span className="show-price__unit"> / night</span>
          </p>

          {/* Owner actions */}
          {isOwner && (
            <div className="show-actions">
              <Link to={`/listings/${id}/edit`} className="btn btn--secondary">
                <Pencil size={14} aria-hidden />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn--danger"
              >
                <Trash2 size={14} aria-hidden />
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>

        {/* ── Map ──────────────────────────────────────────────────────── */}
        <div className="show-map-section">
          <h2 className="show-section-title">Where you'll be</h2>
          <ListingMap
            coordinates={listing.geometry?.coordinates}
            title={listing.title}
          />
        </div>

        {/* ── Reviews ──────────────────────────────────────────────────── */}
        <div className="show-reviews">
          {isAuthenticated ? (
            <ReviewForm listingId={id} />
          ) : (
            <p className="reviews-auth-prompt">
              <Link
                to="/login"
                state={{ from: `/listings/${id}` }}
                className="link"
              >
                Log in
              </Link>{" "}
              to leave a review.
            </p>
          )}

          {reviews.length > 0 && (
            <>
              <h2 className="show-section-title">
                All Reviews ({reviews.length})
              </h2>
              <div className="reviews-grid">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} listingId={id} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
