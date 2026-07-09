import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography, Stack } from "@mui/material";
import { Edit2, Phone, X } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { profileSchema } from "../../schemas";
import { useUpdateProfile } from "../../hooks/useUser";
import { neutral, brand } from "../../theme/tokens";

/**
 * ProfileInfoCard — displays bio (+ phone number for the owner only).
 * Toggles into an inline edit form for the profile owner; read-only
 * for visitors.
 */
export default function ProfileInfoCard({
  username,
  profile,
  isSelf,
  forceEdit,
  onEditHandled,
}) {
  const [editing, setEditing] = useState(false);
  const { mutate: updateProfile, isPending: saving } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      bio: profile?.bio ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
    },
  });

  useEffect(() => {
    reset({
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      bio: profile?.bio ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
    });
  }, [profile, reset]);

  useEffect(() => {
    if (forceEdit) {
      setEditing(true);
      onEditHandled?.();
    }
  }, [forceEdit, onEditHandled]);

  const onSubmit = (data) => {
    const payload = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? null : v]),
    );
    updateProfile(
      { username, data: payload },
      { onSuccess: () => setEditing(false) },
    );
  };

  return (
    <Card variant="raised">
      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: editing ? 2 : 1.5,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, fontSize: "1.0625rem", color: neutral[800] }}
          >
            About
          </Typography>
          {isSelf && (
            <Button
              variant="ghost"
              size="sm"
              startIcon={editing ? <X size={14} /> : <Edit2 size={14} />}
              onClick={() => setEditing((e) => !e)}
            >
              {editing ? "Cancel" : "Edit"}
            </Button>
          )}
        </Box>

        {editing ? (
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
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
              hint="Only visible to you"
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
        ) : (
          <Stack spacing={1.5}>
            {profile?.bio ? (
              <Typography
                variant="body2"
                sx={{ color: neutral[600], lineHeight: 1.7 }}
              >
                {profile.bio}
              </Typography>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: neutral[400], fontStyle: "italic" }}
              >
                {isSelf
                  ? "You haven't written a bio yet."
                  : "This user hasn't written a bio yet."}
              </Typography>
            )}

            {isSelf && profile?.phoneNumber && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Phone size={14} color={neutral[400]} />
                <Typography variant="body2" sx={{ color: neutral[600] }}>
                  {profile.phoneNumber}
                </Typography>
              </Stack>
            )}
          </Stack>
        )}
      </Box>
    </Card>
  );
}
