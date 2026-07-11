import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography, Stack } from "@mui/material";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

import { Card } from "../ui/Card";
import { Input, Textarea } from "../ui/Input";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ConfirmModal } from "../ui/Modal";
import AvatarUploader from "../dashboard/AvatarUploader";
import { profileSchema } from "../../schemas";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  useUpdateProfile,
  useUpdateAvatar,
  useRemoveAvatar,
  useDeleteAccount,
} from "../../hooks/useUser";
import { neutral, semantic } from "../../theme/tokens";

export default function AccountSection() {
  const user = useCurrentUser();
  const username = user?.username;

  const { mutate: updateProfile, isPending: saving } = useUpdateProfile();
  const { mutate: updateAvatar, isPending: uploadingAvatar } =
    useUpdateAvatar();
  const { mutate: removeAvatar, isPending: removingAvatar } = useRemoveAvatar();
  const { mutate: deleteAccount, isPending: deleting } = useDeleteAccount();

  const [avatarError, setAvatarError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", bio: "", phoneNumber: "" },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        bio: user.bio ?? "",
        phoneNumber: user.phoneNumber ?? "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data) => {
    const payload = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? null : v]),
    );
    updateProfile({ username, data: payload });
  };

  const handleAvatarUpload = (file, error) => {
    setAvatarError(error ?? "");
    if (file) updateAvatar({ username, file });
  };

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* ── Read-only account credentials ─────────────────────────────── */}
      <Card variant="raised">
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.0625rem",
              color: neutral[800],
              mb: 2,
            }}
          >
            Account details
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <Input
              label="Username"
              value={username ?? ""}
              disabled
              hint="Usernames can't be changed"
            />
            <Input
              label="Email address"
              value={user?.email ?? ""}
              disabled
              endAdornment={
                user?.emailVerified ? (
                  <Badge
                    tone="success"
                    variant="soft"
                    icon={<ShieldCheck size={12} />}
                  >
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    tone="warning"
                    variant="soft"
                    icon={<ShieldAlert size={12} />}
                  >
                    Unverified
                  </Badge>
                )
              }
            />
          </Box>
        </Box>
      </Card>

      {/* ── Editable profile ─────────────────────────────────────────── */}
      <Card variant="raised">
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{
            p: { xs: 2.5, sm: 3 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, fontSize: "1.0625rem", color: neutral[800] }}
          >
            Profile
          </Typography>

          <AvatarUploader
            avatarUrl={user?.avatar}
            name={user?.username}
            uploading={uploadingAvatar || removingAvatar}
            onUpload={handleAvatarUpload}
            onRemove={() => removeAvatar(username)}
          />
          {avatarError && (
            <Typography variant="caption" sx={{ color: "error.main" }}>
              {avatarError}
            </Typography>
          )}

          <Box sx={{ height: 1, bgcolor: neutral[100] }} />

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <Input
              label="First name"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              label="Last name"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </Box>

          <Input
            label="Phone number"
            placeholder="+91XXXXXXXXXX"
            hint="Include country code"
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />

          <Textarea
            label="Bio"
            placeholder="Tell other travellers a little about yourself…"
            rows={4}
            error={errors.bio?.message}
            {...register("bio")}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={!isDirty || saving}
            >
              Save changes
            </Button>
          </Box>
        </Box>
      </Card>

      {/* ── Danger zone ───────────────────────────────────────────────── */}
      <Card variant="raised" sx={{ borderColor: semantic.error.muted }}>
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <AlertTriangle size={18} color={semantic.error.base} />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.0625rem",
                color: semantic.error.text,
              }}
            >
              Danger zone
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: neutral[500], mb: 2 }}>
            Deleting your account permanently removes your profile, listings,
            reviews, and bookings. This action cannot be undone.
          </Typography>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            Delete account
          </Button>
        </Box>
      </Card>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteAccount(username)}
        loading={deleting}
        title="Delete your account?"
        message="This is permanent and cannot be undone. All your listings, reviews, bookings, and wishlist data will be removed."
        confirmLabel="Yes, delete my account"
        confirmVariant="danger"
      />
    </Stack>
  );
}
