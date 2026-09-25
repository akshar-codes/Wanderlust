import { useEffect, useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Eye } from "lucide-react";
import TwoFactorSetup from "./TwoFactorSetup";

import { Card } from "../ui/Card";
import { Select } from "../ui/Input";
import { Button } from "../ui/Button";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUpdateSettings } from "../../hooks/useUser";
import { brand } from "../../theme/tokens";

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public — anyone can view your profile" },
  {
    value: "hosts_only",
    label: "Hosts only — visible to hosts you've booked with",
  },
  { value: "private", label: "Private — hidden from other users" },
];

export default function PrivacySection() {
  const user = useCurrentUser();
  const username = user?.username;
  const { mutate: updateSettings, isPending: saving } = useUpdateSettings();

  const [profileVisibility, setProfileVisibility] = useState("public");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (user?.settings) {
      setProfileVisibility(user.settings.profileVisibility ?? "public");
      setDirty(false);
    }
  }, [user?.settings]);

  const handleSave = () => {
    updateSettings(
      { username, settings: { profileVisibility } },
      { onSuccess: () => setDirty(false) },
    );
  };

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card variant="raised">
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{ mb: 2 }}
          >
            <Eye size={18} color={brand[500]} />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.0625rem",
                color: "var(--color-text)",
              }}
            >
              Profile visibility
            </Typography>
          </Stack>
          <Select
            label="Who can see your profile"
            options={VISIBILITY_OPTIONS}
            value={profileVisibility}
            onChange={(e) => {
              setProfileVisibility(e.target.value);
              setDirty(true);
            }}
            hint="Controls whether other travellers can view your public profile page."
          />
        </Box>
      </Card>

      <TwoFactorSetup />

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          disabled={!dirty || saving}
        >
          Save changes
        </Button>
      </Box>
    </Stack>
  );
}
