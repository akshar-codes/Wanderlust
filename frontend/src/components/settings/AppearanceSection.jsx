import { useEffect, useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Sun, Moon, Monitor, Globe2 } from "lucide-react";

import { Card } from "../ui/Card";
import { Select } from "../ui/Input";
import { Button } from "../ui/Button";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUpdateSettings } from "../../hooks/useUser";
import { neutral, brand, radii } from "../../theme/tokens";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

// Mirrors backend/src/validators/enums.js::LANGUAGES
const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" },
];

// Mirrors backend/src/validators/enums.js::CURRENCIES
const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR — Indian Rupee (₹)" },
  { value: "USD", label: "USD — US Dollar ($)" },
  { value: "EUR", label: "EUR — Euro (€)" },
  { value: "GBP", label: "GBP — British Pound (£)" },
  { value: "JPY", label: "JPY — Japanese Yen (¥)" },
  { value: "AUD", label: "AUD — Australian Dollar (A$)" },
  { value: "CAD", label: "CAD — Canadian Dollar (C$)" },
  { value: "SGD", label: "SGD — Singapore Dollar (S$)" },
];

function applyLocalTheme(mode) {
  const root = document.documentElement;
  const resolved =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;
  root.classList.toggle("dark", resolved === "dark");
  localStorage.setItem("wl-theme", mode);
}

export default function AppearanceSection() {
  const user = useCurrentUser();
  const username = user?.username;
  const { mutate: updateSettings, isPending: saving } = useUpdateSettings();

  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("INR");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (user?.settings) {
      setTheme(user.settings.theme ?? "system");
      setLanguage(user.settings.language ?? "en");
      setCurrency(user.settings.currency ?? "INR");
      setDirty(false);
    }
  }, [user?.settings]);

  const handleSave = () => {
    applyLocalTheme(theme);
    updateSettings(
      { username, settings: { theme, language, currency } },
      { onSuccess: () => setDirty(false) },
    );
  };

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
            Theme
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1.5,
            }}
          >
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
              const active = theme === value;
              return (
                <Box
                  key={value}
                  onClick={() => {
                    setTheme(value);
                    setDirty(true);
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.75,
                    py: 2.5,
                    borderRadius: radii.lg,
                    cursor: "pointer",
                    border: `1.5px solid ${active ? brand[500] : neutral[200]}`,
                    bgcolor: active ? brand[50] : "#fff",
                    transition: "all 120ms",
                  }}
                >
                  <Icon size={20} color={active ? brand[600] : neutral[500]} />
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: active ? brand[700] : neutral[600],
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <Typography
            variant="caption"
            sx={{ color: neutral[400], mt: 1.5, display: "block" }}
          >
            "System" follows your device's appearance setting.
          </Typography>
        </Box>
      </Card>

      <Card variant="raised">
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{ mb: 2 }}
          >
            <Globe2 size={18} color={brand[500]} />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.0625rem",
                color: neutral[800],
              }}
            >
              Regional preferences
            </Typography>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <Select
              label="Language"
              options={LANGUAGE_OPTIONS}
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setDirty(true);
              }}
            />
            <Select
              label="Currency"
              options={CURRENCY_OPTIONS}
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                setDirty(true);
              }}
            />
          </Box>
        </Box>
      </Card>

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
