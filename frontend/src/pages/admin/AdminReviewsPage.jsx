import { useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Search, Trash2, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { Table } from "../../components/ui/Table";
import { SearchInput, Select } from "../../components/ui/Input";
import { IconButton } from "../../components/ui/Button";
import { ConfirmModal } from "../../components/ui/Modal";
import { useAdminReviews } from "../../hooks/useAdmin";
import { useDeleteReview } from "../../hooks/useReviews";
import { neutral } from "../../theme/tokens";

const RATING_OPTIONS = [
  { value: "", label: "All ratings" },
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars" },
  { value: "3", label: "3 stars" },
  { value: "2", label: "2 stars" },
  { value: "1", label: "1 star" },
];

const PAGE_LIMIT = 20;

function RatingDisplay({ value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Star size={13} fill="#f59e0b" stroke="none" />
      <Typography sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>{value}</Typography>
    </Box>
  );
}

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useAdminReviews({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    rating: rating || undefined,
  });

  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;

  // useDeleteReview is scoped to a listing — re-bound to whichever review is
  // currently staged for deletion via the confirm modal.
  const deleteMutation = useDeleteReview(pendingDelete?.listing?._id);

  const columns = [
    {
      key: "author",
      label: "Author",
      render: (row) => (row.author ? `@${row.author.username}` : "Unknown"),
    },
    {
      key: "listing",
      label: "Listing",
      render: (row) =>
        row.listing ? (
          <Typography
            component={Link}
            to={`/listings/${row.listing._id}`}
            target="_blank"
            sx={{
              fontSize: "0.8125rem",
              color: neutral[700],
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 200,
              display: "block",
            }}
          >
            {row.listing.title}
          </Typography>
        ) : (
          "Deleted listing"
        ),
    },
    { key: "rating", label: "Rating", render: (row) => <RatingDisplay value={row.rating} /> },
    {
      key: "comment",
      label: "Comment",
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            color: neutral[600],
            maxWidth: 320,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {row.comment}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      label: "Posted",
      sortable: true,
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton color="danger" label="Delete review" size="sm" onClick={() => setPendingDelete(row)}>
            <Trash2 size={15} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const handleConfirmDelete = () => {
    if (!pendingDelete?._id) return;
    setDeleting(true);
    deleteMutation.mutate(pendingDelete._id, {
      onSuccess: () => {
        setDeleting(false);
        setPendingDelete(null);
      },
      onError: () => setDeleting(false),
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <SearchInput
            fullWidth
            placeholder="Search review comments…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            startAdornment={<Search size={16} color={neutral[400]} />}
          />
        </Box>
        <Box sx={{ width: 160 }}>
          <Select
            options={RATING_OPTIONS}
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setPage(1);
            }}
          />
        </Box>
      </Box>

      <Table
        columns={columns}
        rows={reviews}
        rowKey="_id"
        loading={isLoading}
        skeletonRows={8}
        emptyMessage="No reviews found."
        pagination={
          pagination?.totalPages > 1
            ? { page, totalPages: pagination.totalPages, onChange: setPage }
            : undefined
        }
      />

      <ConfirmModal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete this review?"
        message="This permanently removes the review and recalculates the listing's rating. This action cannot be undone."
        confirmLabel="Yes, delete"
        confirmVariant="danger"
      />
    </Box>
  );
}
