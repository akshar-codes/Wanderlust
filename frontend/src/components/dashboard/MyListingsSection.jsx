import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Typography, Chip, Stack } from "@mui/material";
import { PlusCircle, Eye, Edit2, Trash2, EyeOff, Send } from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "../ui/Card";
import { Table } from "../ui/Table";
import { Button, IconButton } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ConfirmModal } from "../ui/Modal";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUserListings, USER_LISTINGS_KEY } from "../../hooks/useUser";
import { useDeleteListing, LISTINGS_KEY } from "../../hooks/useListings";
import listingsService from "../../services/listings.service";
import { formatPrice } from "../../utils/currency";
import { STATUS_CHIP } from "../../utils/statusColors";

function StatusChip({ listing }) {
  if (listing.draft) {
    return <Chip label="Draft" size="small" sx={STATUS_CHIP.warning} />;
  }
  if (listing.status === "active") {
    return <Chip label="Live" size="small" sx={STATUS_CHIP.success} />;
  }
  return (
    <Chip
      label={listing.status}
      size="small"
      sx={{
        ...STATUS_CHIP.error,
        textTransform: "capitalize",
      }}
    />
  );
}

/**
 * Generic publish/unpublish toggle mutation — accepts the target id per
 * call (via `mutate({ id, publish })`), so a single hook instance can
 * safely serve every row in the table instead of baking one id into a
 * per-listing closure like usePublishListing/useUnpublishListing do.
 */
function useSetListingPublished() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, publish }) =>
      publish ? listingsService.publish(id) : listingsService.unpublish(id),
    onSuccess: (_updated, { publish }) => {
      qc.invalidateQueries({ queryKey: [USER_LISTINGS_KEY] });
      qc.invalidateQueries({ queryKey: [LISTINGS_KEY] });
      toast.success(
        publish ? "Listing published." : "Listing moved to drafts.",
      );
    },
    onError: (err) => toast.error(err.message || "Failed to update listing"),
  });
}

export default function MyListingsSection() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { data, isLoading } = useUserListings(user?.username);
  const listings = data ?? [];

  const deleteMutation = useDeleteListing();
  const deleteListing = deleteMutation.mutate;
  const deleting = deleteMutation.isPending;
  const {
    mutate: setPublished,
    isPending: togglingPublish,
    variables,
  } = useSetListingPublished();

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const columns = [
    {
      key: "title",
      label: "Listing",
      render: (row) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            minWidth: 220,
          }}
        >
          <Box
            component="img"
            src={row.image?.url}
            alt=""
            sx={{
              width: 48,
              height: 48,
              borderRadius: "10px",
              objectFit: "cover",
              flexShrink: 0,
              bgcolor: "var(--color-surface-2)",
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.875rem",
                color: "var(--color-text)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 220,
              }}
            >
              {row.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "var(--color-text-secondary)" }}
            >
              {row.location}, {row.country}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "price",
      label: "Price / night",
      sortable: true,
      render: (row) => formatPrice(Number(row.price ?? 0)),
    },
    {
      key: "averageRating",
      label: "Rating",
      sortable: true,
      render: (row) =>
        row.reviewCount > 0
          ? `${row.averageRating.toFixed(1)} (${row.reviewCount})`
          : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusChip listing={row} />,
    },
    {
      key: "actions",
      label: "",
      render: (row) => {
        const isTogglingThisRow = togglingPublish && variables?.id === row._id;
        return (
          <Stack direction="row" spacing={0.5}>
            <IconButton
              component={Link}
              to={`/listings/${row._id}`}
              color="primary"
              label="View listing"
              size="sm"
            >
              <Eye size={15} />
            </IconButton>
            <IconButton
              color="primary"
              label="Edit listing"
              size="sm"
              onClick={() => navigate(`/listings/${row._id}/edit`)}
            >
              <Edit2 size={15} />
            </IconButton>
            {row.draft ? (
              <IconButton
                color="primary"
                label="Publish listing"
                size="sm"
                disabled={isTogglingThisRow}
                onClick={() => setPublished({ id: row._id, publish: true })}
              >
                <Send size={14} />
              </IconButton>
            ) : (
              <IconButton
                color="primary"
                label="Unpublish listing"
                size="sm"
                disabled={isTogglingThisRow}
                onClick={() => setPublished({ id: row._id, publish: false })}
              >
                <EyeOff size={15} />
              </IconButton>
            )}
            <IconButton
              color="danger"
              label="Delete listing"
              size="sm"
              onClick={() => setConfirmDeleteId(row._id)}
            >
              <Trash2 size={15} />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  return (
    <Card variant="raised">
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.0625rem",
              color: "var(--color-text)",
            }}
          >
            My Listings
          </Typography>
          <Button
            variant="primary"
            size="sm"
            startIcon={<PlusCircle size={15} />}
            onClick={() => navigate("/listings/new")}
          >
            New listing
          </Button>
        </Box>

        {!isLoading && listings.length === 0 ? (
          <EmptyState
            variant="listings"
            action={
              <Button
                variant="primary"
                onClick={() => navigate("/listings/new")}
              >
                Create your first listing
              </Button>
            }
          />
        ) : (
          <Table
            columns={columns}
            rows={listings}
            rowKey="_id"
            loading={isLoading}
            skeletonRows={4}
            emptyMessage="No listings found."
          />
        )}
      </Box>

      <ConfirmModal
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          deleteListing(confirmDeleteId, {
            onSuccess: () => setConfirmDeleteId(null),
          });
        }}
        loading={deleting}
        title="Delete this listing?"
        message="This action is permanent and cannot be undone. All associated reviews will also be removed."
        confirmLabel="Yes, delete"
        confirmVariant="danger"
      />
    </Card>
  );
}
