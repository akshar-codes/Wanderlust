import { Box, Typography, Stack } from "@mui/material";
import { Edit2, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import AvatarUploader from "../dashboard/AvatarUploader";
import { Badge } from "../ui/Badge";
import { brand, neutral, fonts, radii } from "../../theme/tokens";

function formatMemberSince(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
  });
}

/**
 * ProfileCoverBanner — gradient hero with overlapping avatar.
 * Read-only for visitors; shows avatar upload + "Edit profile" affordance
 * for the profile owner.
 */
export default function ProfileCoverBanner({
  user,
  isSelf,
  onEditClick,
  onAvatarUpload,
  onAvatarRemove,
  avatarUploading,
}) {
  const displayName = user?.displayName || user?.username;
  const memberSince = formatMemberSince(user?.createdAt);

  return (
    <Box sx={{ mb: { xs: 7, sm: 8 } }}>
      {/* Gradient cover */}
      <Box
        sx={{
          height: { xs: 140, sm: 180 },
          borderRadius: radii["2xl"],
          background: `linear-gradient(135deg, ${brand[500]} 0%, ${brand[700]} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.25,
            background:
              "radial-gradient(circle at 20% 20%, #fff 0%, transparent 40%), radial-gradient(circle at 80% 60%, #fff 0%, transparent 35%)",
          }}
        />
        {isSelf && (
          <Box
            component={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onEditClick}
            type="button"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.75,
              py: 0.9,
              borderRadius: radii.full,
              border: "none",
              bgcolor: "rgba(255,255,255,0.92)",
              color: neutral[800],
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
          >
            <Edit2 size={14} /> Edit profile
          </Box>
        )}
      </Box>

      {/* Avatar + identity, overlapping the cover */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "center", sm: "flex-end" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          px: { xs: 1, sm: 2 },
          mt: { xs: -6, sm: -7 },
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        <Box
          sx={{
            border: "4px solid #fff",
            borderRadius: "50%",
            bgcolor: "#fff",
            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
            flexShrink: 0,
          }}
        >
          {isSelf ? (
            <AvatarUploader
              avatarUrl={user?.avatar}
              name={user?.username}
              size={104}
              uploading={avatarUploading}
              onUpload={onAvatarUpload}
              onRemove={onAvatarRemove}
              showLabel={false}
            />
          ) : (
            <Box
              sx={{
                width: 104,
                height: 104,
                borderRadius: "50%",
                overflow: "hidden",
                bgcolor: brand[100],
                color: brand[700],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                fontWeight: 700,
              }}
            >
              {user?.avatar ? (
                <Box
                  component="img"
                  src={user.avatar}
                  alt={displayName}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                (displayName?.[0]?.toUpperCase() ?? "?")
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ pb: { xs: 0, sm: 1 }, minWidth: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            flexWrap="wrap"
            justifyContent={{ xs: "center", sm: "flex-start" }}
          >
            <Typography
              sx={{
                fontFamily: fonts.display,
                fontSize: "1.5rem",
                color: neutral[800],
                lineHeight: 1.2,
              }}
            >
              {displayName}
            </Typography>
            {user?.emailVerified && (
              <Badge
                tone="success"
                variant="soft"
                icon={<ShieldCheck size={12} />}
              >
                Verified
              </Badge>
            )}
            {user?.isHost && (
              <Badge tone="brand" variant="soft" icon={<Sparkles size={12} />}>
                Host
              </Badge>
            )}
          </Stack>
          <Typography variant="body2" sx={{ color: neutral[500], mt: 0.25 }}>
            @{user?.username}
          </Typography>
          {memberSince && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              justifyContent={{ xs: "center", sm: "flex-start" }}
              sx={{ mt: 0.75 }}
            >
              <MapPin size={12} color={neutral[400]} />
              <Typography variant="caption" sx={{ color: neutral[400] }}>
                Member since {memberSince}
              </Typography>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
