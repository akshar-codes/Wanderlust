import { useCallback, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import { AlertTriangle } from "lucide-react";

import { useCurrentUser } from "../hooks/useCurrentUser";
import {
  useUserProfileFull,
  useUserListings,
  useUserReviewsReceived,
  useUpdateAvatar,
  useRemoveAvatar,
} from "../hooks/useUser";
import { useWishlist } from "../hooks/useWishlist";
import { useMyBookings } from "../hooks/useBookings";
import { useMyReviews } from "../hooks/useReviews";

import {
  ProfileCoverBanner,
  ProfileCompletionScore,
  ProfileStatsCards,
  ProfileInfoCard,
  HostedListingsSection,
  ProfileReviewsSection,
  ActivityTimeline,
} from "../components/profile";
import WishlistSection from "../components/dashboard/WishlistSection";
import { Skeleton } from "../components/ui/Skeleton";
import { neutral } from "../theme/tokens";

const TIMELINE_FETCH_LIMIT = 5;

export default function UserProfilePage() {
  const { username } = useParams();
  const currentUser = useCurrentUser();
  const isSelf = Boolean(
    currentUser?.username &&
    username &&
    currentUser.username.toLowerCase() === username.toLowerCase(),
  );

  const [forceEditInfo, setForceEditInfo] = useState(false);
  const handleEditClick = useCallback(() => setForceEditInfo(true), []);
  const handleEditHandled = useCallback(() => setForceEditInfo(false), []);

  // ── Core profile data (public — safe for any visitor) ───────────────────
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useUserProfileFull(username);

  const { data: listings = [], isLoading: listingsLoading } =
    useUserListings(username);

  const { data: reviewsReceivedFeed } = useUserReviewsReceived(username, {
    page: 1,
    limit: TIMELINE_FETCH_LIMIT,
  });

  // ── Self-only data (authenticated endpoints) ──────────────────────────────
  const { data: wishlistData } = useWishlist({
    page: 1,
    limit: TIMELINE_FETCH_LIMIT,
    enabled: isSelf,
  });
  const { data: myBookingsData } = useMyBookings({
    page: 1,
    limit: TIMELINE_FETCH_LIMIT,
    enabled: isSelf,
  });
  const { data: myReviewsData } = useMyReviews({
    page: 1,
    limit: TIMELINE_FETCH_LIMIT,
    enabled: isSelf,
  });

  // ── Avatar mutations (used by the cover banner for the owner) ────────────
  const { mutate: updateAvatar, isPending: uploadingAvatar } =
    useUpdateAvatar();
  const { mutate: removeAvatar, isPending: removingAvatar } = useRemoveAvatar();

  const handleAvatarUpload = (file) => {
    if (file) updateAvatar({ username, file });
  };

  if (!username) return <Navigate to="/" replace />;

  if (profileError) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          py: 12,
          textAlign: "center",
        }}
      >
        <AlertTriangle size={40} color={neutral[400]} />
        <Typography
          sx={{ fontWeight: 700, fontSize: "1.25rem", color: neutral[800] }}
        >
          User not found
        </Typography>
        <Typography variant="body2" sx={{ color: neutral[500] }}>
          We couldn't find a profile for “{username}”.
        </Typography>
      </Box>
    );
  }

  const user = profileData?.user;
  const hostStats = profileData?.hostStats;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 0, sm: 1 }, pb: 8 }}>
      {profileLoading ? (
        <Box sx={{ pt: 4 }}>
          <Skeleton.Avatar size={104} lines={2} />
        </Box>
      ) : (
        <ProfileCoverBanner
          user={user}
          isSelf={isSelf}
          onEditClick={handleEditClick}
          onAvatarUpload={handleAvatarUpload}
          onAvatarRemove={() => removeAvatar(username)}
          avatarUploading={uploadingAvatar || removingAvatar}
        />
      )}

      <Box sx={{ mb: 3 }}>
        <ProfileStatsCards hostStats={hostStats} loading={profileLoading} />
      </Box>

      <Grid container spacing={3}>
        {/* ── Sidebar: completion score + editable info ─────────────────── */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              position: { md: "sticky" },
              top: { md: 88 },
            }}
          >
            {isSelf && <ProfileCompletionScore user={user} />}
            {!profileLoading && (
              <ProfileInfoCard
                username={username}
                profile={user}
                isSelf={isSelf}
                forceEdit={forceEditInfo}
                onEditHandled={handleEditHandled}
              />
            )}
          </Box>
        </Grid>

        {/* ── Main content ──────────────────────────────────────────────── */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <HostedListingsSection
              listings={listings}
              loading={listingsLoading}
              isSelf={isSelf}
            />

            {isSelf && <WishlistSection />}

            <ProfileReviewsSection
              username={username}
              profileUserId={user?.id}
            />

            <ActivityTimeline
              joinedAt={user?.createdAt}
              displayName={user?.displayName ?? user?.username}
              listings={listings}
              reviewsReceived={reviewsReceivedFeed?.reviews ?? []}
              isSelf={isSelf}
              wishlistItems={isSelf ? (wishlistData?.items ?? []) : []}
              myReviews={isSelf ? (myReviewsData?.reviews ?? []) : []}
              myBookings={isSelf ? (myBookingsData?.bookings ?? []) : []}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
