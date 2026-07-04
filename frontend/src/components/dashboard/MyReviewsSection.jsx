import { useState } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Pagination } from "@mui/material";
import { Trash2 } from "lucide-react";

import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { ConfirmModal } from "../ui/Modal";
import StarRating from "../common/StarRating";
import { useMyReviews, useDeleteMyReview } from "../../hooks/useReviews";
import { neutral, brand, radii } from "../../theme/tokens";

const PAGE_LIMIT = 10;

function ReviewRow({ review, onDelete }) {
  const listing = review.listing;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        p: 2.5,
        border: `1px solid ${neutral[200]}`,
        borderRadius: radii.xl,
      }}
    >
      {listing && (
        <Box
          component={Link}
          to={`/listings/${listing._id}`}
          sx={{ flexShrink: 0, display: "block" }}
        >
          <Box
            component="img"
            src={listing.image?.url}
            alt={listing.title}
            sx={{
              width: 72,
              height: 72,
              borderRadius: radii.lg,
              objectFit: "cover",
              bgcolor: neutral[100],
            }}
          />
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {listing ? (
              <Typography
                component={Link}
                to={`/listings/${listing._id}`}
                sx={{
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: neutral[800],
                  textDecoration: "none",
                  "&:hover": { color: brand[600] },
                }}
              >
                {listing.title}
              </Typography>
            ) : (
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: neutral[500],
                }}
              >
                Listing no longer available
              </Typography>
            )}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <StarRating rating={review.rating} size={14} />
              {review.createdAt && (
                <Typography variant="caption" sx={{ color: neutral[400] }}>
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              )}
            </Box>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={() => onDelete(review)}
            aria-label="Delete review"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: `1px solid ${neutral[200]}`,
              background: "none",
              color: neutral[400],
              cursor: "pointer",
              flexShrink: 0,
              "&:hover": {
                color: "#ef4444",
                borderColor: "#fca5a5",
                bgcolor: "#fef2f2",
              },
            }}
          >
            <Trash2 size={14} />
          </Box>
        </Box>

        {review.comment && (
          <Typography
            variant="body2"
            sx={{ color: neutral[600], mt: 1, lineHeight: 1.6 }}
          >
            {review.comment}
          </Typography>
        )}

        {review.hostReply?.text && (
          <Box
            sx={{
              mt: 1.5,
              bgcolor: neutral[50],
              border: `1px solid ${neutral[200]}`,
              borderRadius: radii.md,
              p: 1.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: neutral[700] }}
            >
              Host response
            </Typography>
            <Typography variant="body2" sx={{ color: neutral[600], mt: 0.5 }}>
              {review.hostReply.text}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function MyReviewsSection() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyReviews({ page, limit: PAGE_LIMIT });
  const { mutate: deleteReview, isPending: deleting } = useDeleteMyReview();
  const [pendingDelete, setPendingDelete] = useState(null);

  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;

  return (
    <Card variant="raised">
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1.0625rem",
            color: neutral[800],
            mb: 2.5,
          }}
        >
          My Reviews
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Array.from({ length: 3 }, (_, i) => (
              <Box
                key={i}
                sx={{
                  border: `1px solid ${neutral[200]}`,
                  borderRadius: radii.xl,
                  p: 2.5,
                }}
              >
                <Skeleton.Avatar size={44} lines={2} />
                <Box sx={{ mt: 1.5 }}>
                  <Skeleton.Text lines={2} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : reviews.length === 0 ? (
          <EmptyState
            variant="reviews"
            title="You haven't written any reviews yet"
            body="Reviews you leave on listings will show up here."
          />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {reviews.map((review) => (
              <ReviewRow
                key={review._id}
                review={review}
                onDelete={setPendingDelete}
              />
            ))}
          </Box>
        )}

        {pagination?.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              shape="rounded"
              color="primary"
            />
          </Box>
        )}
      </Box>

      <ConfirmModal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteReview(
            {
              listingId: pendingDelete.listing?._id,
              reviewId: pendingDelete._id,
            },
            { onSuccess: () => setPendingDelete(null) },
          );
        }}
        loading={deleting}
        title="Delete this review?"
        message="This action is permanent and cannot be undone."
        confirmLabel="Yes, delete"
        confirmVariant="danger"
      />
    </Card>
  );
}
