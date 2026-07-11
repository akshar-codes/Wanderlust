import { useEffect, useState } from "react";
import { Box, Typography, Stack, Switch, Divider } from "@mui/material";
import { Mail, Smartphone, MessageCircle } from "lucide-react";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUpdateNotificationPreferences } from "../../hooks/useUser";
import { neutral, brand } from "../../theme/tokens";

const GROUPS = [
  {
    key: "email",
    label: "Email",
    icon: Mail,
    fields: [
      {
        key: "bookingRequests",
        label: "Booking requests",
        hint: "When a guest requests to book your listing",
      },
      {
        key: "bookingUpdates",
        label: "Booking updates",
        hint: "Changes or cancellations to your bookings",
      },
      {
        key: "newReviews",
        label: "New reviews",
        hint: "When someone reviews your listing",
      },
      {
        key: "promotions",
        label: "Promotions",
        hint: "Deals and offers from Wanderlust",
      },
      {
        key: "newsletter",
        label: "Newsletter",
        hint: "Occasional travel inspiration and updates",
      },
    ],
  },
  {
    key: "push",
    label: "Push notifications",
    icon: Smartphone,
    fields: [
      { key: "bookingRequests", label: "Booking requests" },
      { key: "bookingUpdates", label: "Booking updates" },
      { key: "newReviews", label: "New reviews" },
    ],
  },
  {
    key: "sms",
    label: "SMS",
    icon: MessageCircle,
    fields: [
      { key: "bookingRequests", label: "Booking requests" },
      { key: "bookingUpdates", label: "Booking updates" },
    ],
  },
];

const DEFAULTS = {
  email: {
    bookingRequests: true,
    bookingUpdates: true,
    newReviews: true,
    promotions: false,
    newsletter: false,
  },
  push: { bookingRequests: true, bookingUpdates: true, newReviews: true },
  sms: { bookingRequests: false, bookingUpdates: true },
};

function Row({ label, hint, checked, onChange }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 1.25,
      }}
    >
      <Box>
        <Typography
          sx={{ fontSize: "0.875rem", fontWeight: 600, color: neutral[700] }}
        >
          {label}
        </Typography>
        {hint && (
          <Typography variant="caption" sx={{ color: neutral[500] }}>
            {hint}
          </Typography>
        )}
      </Box>
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        color="primary"
      />
    </Box>
  );
}

export default function NotificationsSection() {
  const user = useCurrentUser();
  const username = user?.username;
  const { mutate: updatePrefs, isPending: saving } =
    useUpdateNotificationPreferences();

  const [prefs, setPrefs] = useState(DEFAULTS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPrefs({
        email: { ...DEFAULTS.email, ...user.notificationPreferences.email },
        push: { ...DEFAULTS.push, ...user.notificationPreferences.push },
        sms: { ...DEFAULTS.sms, ...user.notificationPreferences.sms },
      });
      setDirty(false);
    }
  }, [user?.notificationPreferences]);

  const toggle = (group, key, value) => {
    setPrefs((p) => ({ ...p, [group]: { ...p[group], [key]: value } }));
    setDirty(true);
  };

  const handleSave = () => {
    updatePrefs({ username, prefs }, { onSuccess: () => setDirty(false) });
  };

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {GROUPS.map((group) => (
        <Card variant="raised" key={group.key}>
          <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={{ mb: 1 }}
            >
              <group.icon size={18} color={brand[500]} />
              <Typography
                sx={{ fontWeight: 700, fontSize: "1rem", color: neutral[800] }}
              >
                {group.label}
              </Typography>
            </Stack>
            <Box>
              {group.fields.map((field, i) => (
                <Box key={field.key}>
                  <Row
                    label={field.label}
                    hint={field.hint}
                    checked={Boolean(prefs[group.key]?.[field.key])}
                    onChange={(v) => toggle(group.key, field.key, v)}
                  />
                  {i < group.fields.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          </Box>
        </Card>
      ))}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          position: "sticky",
          bottom: 16,
        }}
      >
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          disabled={!dirty || saving}
        >
          Save preferences
        </Button>
      </Box>
    </Stack>
  );
}
