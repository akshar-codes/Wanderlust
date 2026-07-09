import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography, Stack } from "@mui/material";
import { Mail, ShieldCheck, ShieldAlert } from "lucide-react";

import { Card } from "../ui/Card";
import { Input, Textarea } from "../ui/Input";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { Badge } from "../ui/Badge";
import AvatarUploader from "./AvatarUploader";
import { profileSchema } from "../../schemas";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  useUserProfile,
  useUpdateProfile,
  useUpdateAvatar,
  useRemoveAvatar,
} from "../../hooks/useUser";
import { neutral } from "../../theme/tokens";

export default function ProfileSection() {
  const authUser = useCurrentUser();
  const username = authUser?.username;

  const { data: profile, isLoading } = useUserProfile(username);
  const { mutate: updateProfile, isPending: saving } = useUpdateProfile();
  const { mutate: updateAvatar, isPending: uploadingAvatar } =
    useUpdateAvatar();
  const { mutate: removeAvatar, isPending: removingAvatar } = useRemoveAvatar();
  const [avatarError, setAvatarError] = useState("");

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
    if (profile) {
      reset({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        bio: profile.bio ?? "",
        phoneNumber: profile.phoneNumber ?? "",
      });
    }
  }, [profile, reset]);

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

  if (isLoading) {
    return (
      <Card variant="raised">
        <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Skeleton.Avatar size={84} lines={2} />
          <Box sx={{ mt: 4 }}>
            <Skeleton.Form fields={4} />
          </Box>
        </Box>
      </Card>
    );
  }

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Verification status */}
      <Card variant="raised">
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Mail size={18} color={neutral[500]} />
            <Box>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  color: neutral[800],
                }}
              >
                {authUser?.email}
              </Typography>
              <Typography variant="caption" sx={{ color: neutral[500] }}>
                Account email
              </Typography>
            </Box>
          </Box>
          {authUser?.emailVerified ? (
            <Badge
              tone="success"
              variant="soft"
              icon={<ShieldCheck size={13} />}
            >
              Verified
            </Badge>
          ) : (
            <Badge
              tone="warning"
              variant="soft"
              icon={<ShieldAlert size={13} />}
            >
              Not verified
            </Badge>
          )}
        </Box>
      </Card>

      {/* Profile form */}
      <Card variant="raised">
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{
            p: { xs: 2.5, sm: 4 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <AvatarUploader
            avatarUrl={authUser?.avatar}
            name={authUser?.username}
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
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <Input
              label="First name"
              placeholder="Akshar"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              label="Last name"
              placeholder="Gupta"
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
    </Stack>
  );
}
