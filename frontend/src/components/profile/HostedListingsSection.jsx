import { Box, Typography } from "@mui/material";
import { Home, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, ListingCard } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { Button } from "../ui/Button";
import { neutral } from "../../theme/tokens";

export default function HostedListingsSection({ listings, loading, isSelf }) {
  const navigate = useNavigate();

  const visibleListings = isSelf
    ? listings
    : listings.filter((l) => !l.draft && l.status === "active");

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
            sx={{ fontWeight: 700, fontSize: "1.0625rem", color: neutral[800] }}
          >
            {isSelf ? "My Listings" : "Hosted Listings"}
          </Typography>
          {isSelf && (
            <Button
              variant="primary"
              size="sm"
              startIcon={<PlusCircle size={15} />}
              onClick={() => navigate("/listings/new")}
            >
              New listing
            </Button>
          )}
        </Box>

        {loading ? (
          <Skeleton.Grid count={4} minColumnWidth={220} />
        ) : visibleListings.length === 0 ? (
          <EmptyState
            variant="listings"
            icon={<Home size={36} />}
            title={
              isSelf ? "You haven't listed a space yet" : "No listings yet"
            }
            body={
              isSelf
                ? "Create your first listing to start hosting travellers."
                : "This user hasn't published any listings yet."
            }
            action={
              isSelf && (
                <Button
                  variant="primary"
                  onClick={() => navigate("/listings/new")}
                >
                  Create your first listing
                </Button>
              )
            }
          />
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: "24px 20px",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            }}
          >
            {visibleListings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </Box>
        )}
      </Box>
    </Card>
  );
}
