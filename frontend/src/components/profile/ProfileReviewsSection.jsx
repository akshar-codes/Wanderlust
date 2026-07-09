import { useState } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Pagination } from "@mui/material";
import { MessageSquare } from "lucide-react";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import ReviewCard from "../reviews/ReviewCard";
import { useUserReviewsReceived } from "../../hooks/useUser";
import { neutral, brand } from "../../theme/tokens";

const PAGE_LIMIT = 10;

export default function ProfileReviewsSection({ username, profileUserId }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserReviewsReceived(username, {
    page,
    limit: PAGE_LIMIT,
  });

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
          Reviews
          {typeof pagination?.total === "number" && pagination.total > 0 && (
            <Box component="span" sx={{ color: neutral[400], fontWeight: 500 }}>
              {" "}
              ({pagination.total})
            </Box>
          )}
        </Typography>

        {isLoading ? (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {Array.from({ length: 2 }, (_, i) => (
              <Box
                key={i}
                sx={{
                  border: `1px solid ${neutral[200]}`,
                  borderRadius: "20px",
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
            icon={<MessageSquare size={36} />}
            title="No reviews yet"
            body="Reviews left by guests on this host's listings will appear here."
          />
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {reviews.map((review) => (
              <Box
                key={review._id}
                sx={{ display: "flex", flexDirection: "column", gap: 1 }}
              >
                {review.listing && (
                  <Typography
                    component={Link}
                    to={`/listings/${review.listing._id}`}
                    variant="caption"
                    sx={{
                      color: brand[600],
                      fontWeight: 700,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    On “{review.listing.title}”
                  </Typography>
                )}
                <ReviewCard
                  review={review}
                  listingId={review.listing?._id}
                  listingOwnerId={profileUserId}
                />
              </Box>
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
    </Card>
  );
}
