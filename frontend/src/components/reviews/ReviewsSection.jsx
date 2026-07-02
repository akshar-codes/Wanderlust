import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "@mui/material";
import ReviewStats from "./ReviewStats";
import ReviewToolbar from "./ReviewToolbar";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { useListingReviews, useReviewStats } from "../../hooks/useReviews";
import { useAuthStore } from "../../store/auth.store";

export default function ReviewsSection({ listingId, listingOwnerId }) {
  const { isAuthenticated } = useAuthStore();

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("recent");
  const [ratingFilter, setRatingFilter] = useState(null);
  const [withPhotos, setWithPhotos] = useState(false);
  const [keyword, setKeyword] = useState("");

  const queryOpts = useMemo(
    () => ({
      page,
      limit: 10,
      sort,
      rating: ratingFilter ?? undefined,
      withPhotos: withPhotos || undefined,
      keyword: keyword || undefined,
    }),
    [page, sort, ratingFilter, withPhotos, keyword],
  );

  const { data: statsData, isLoading: statsLoading } =
    useReviewStats(listingId);
  const { data, isLoading, isFetching } = useListingReviews(
    listingId,
    queryOpts,
  );

  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;

  const handleSortChange = (v) => {
    setSort(v);
    setPage(1);
  };
  const handleRatingFilterChange = (v) => {
    setRatingFilter(v);
    setPage(1);
  };
  const handleWithPhotosChange = (v) => {
    setWithPhotos(v);
    setPage(1);
  };
  const handleKeywordChange = (v) => {
    setKeyword(v);
    setPage(1);
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <h2
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "1.625rem",
          color: "#261f1a",
          margin: "0 0 4px",
        }}
      >
        Reviews
      </h2>

      {/* Stats / rating breakdown */}
      <ReviewStats
        stats={statsData}
        loading={statsLoading}
        activeFilter={ratingFilter}
        onFilterChange={handleRatingFilterChange}
      />

      {/* Sort + filter toolbar */}
      {(statsData?.count ?? 0) > 0 && (
        <ReviewToolbar
          sort={sort}
          onSortChange={handleSortChange}
          ratingFilter={ratingFilter}
          onRatingFilterChange={handleRatingFilterChange}
          withPhotos={withPhotos}
          onWithPhotosChange={handleWithPhotosChange}
          keyword={keyword}
          onKeywordChange={handleKeywordChange}
          totalCount={pagination?.total ?? statsData?.count ?? 0}
        />
      )}

      {/* List */}
      <div style={{ position: "relative", minHeight: 120 }}>
        {isLoading ? (
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              paddingTop: 8,
            }}
          >
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #ebe7e3",
                  borderRadius: 20,
                  padding: 20,
                }}
              >
                <Skeleton.Avatar size={44} lines={2} />
                <div style={{ marginTop: 14 }}>
                  <Skeleton.Text lines={3} />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            variant={
              ratingFilter || withPhotos || keyword ? "search" : "reviews"
            }
            title={
              ratingFilter || withPhotos || keyword
                ? "No matching reviews"
                : undefined
            }
            body={
              ratingFilter || withPhotos || keyword
                ? "Try clearing your filters to see all reviews."
                : undefined
            }
            compact
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${page}-${sort}-${ratingFilter}-${withPhotos}-${keyword}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: isFetching ? 0.6 : 1 }}
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                paddingTop: 8,
              }}
            >
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  listingId={listingId}
                  listingOwnerId={listingOwnerId}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 32 }}
        >
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={(_, p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            shape="rounded"
            color="primary"
          />
        </div>
      )}

      {/* Review form */}
      <div style={{ marginTop: 40 }}>
        {isAuthenticated ? (
          <ReviewForm listingId={listingId} />
        ) : (
          <div
            style={{
              padding: "24px",
              border: "1.5px dashed #d6d0ca",
              borderRadius: 20,
              textAlign: "center",
              color: "#8a8179",
              fontSize: "0.9375rem",
            }}
          >
            Log in to leave a review for this listing.
          </div>
        )}
      </div>
    </section>
  );
}
