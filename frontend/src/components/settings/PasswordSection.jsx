import { Box, Typography, Stack } from "@mui/material";
import { KeyRound, Mail, CheckCircle2, Info } from "lucide-react";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useForgotPassword } from "../../hooks/useAuth";
import { neutral, brand, semantic, radii } from "../../theme/tokens";

export default function PasswordSection() {
  const user = useCurrentUser();
  const hasLocalPassword = Boolean(user?.linkedProviders?.local);
  const { mutate: sendResetEmail, isPending, isSuccess } = useForgotPassword();

  const connectedProviders = [
    user?.linkedProviders?.google && "Google",
    user?.linkedProviders?.github && "GitHub",
  ].filter(Boolean);

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card variant="raised">
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{ mb: 1 }}
          >
            <KeyRound size={18} color={neutral[500]} />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.0625rem",
                color: neutral[800],
              }}
            >
              Password
            </Typography>
          </Stack>

          {hasLocalPassword ? (
            <>
              <Typography
                variant="body2"
                sx={{ color: neutral[500], mb: 3, lineHeight: 1.7 }}
              >
                For your security, passwords aren't changed in-app. We'll email
                a secure reset link to <strong>{user?.email}</strong> — follow
                it to set a new password.
              </Typography>

              {isSuccess ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.25,
                    p: 2,
                    borderRadius: radii.lg,
                    bgcolor: semantic.success.light,
                    border: `1px solid ${semantic.success.muted}`,
                  }}
                >
                  <CheckCircle2
                    size={18}
                    color={semantic.success.base}
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        color: semantic.success.text,
                      }}
                    >
                      Reset email sent
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: semantic.success.text, mt: 0.25 }}
                    >
                      Check your inbox at {user?.email} for the reset link — it
                      expires in 60 minutes.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Button
                  variant="primary"
                  startIcon={<Mail size={15} />}
                  loading={isPending}
                  onClick={() => user?.email && sendResetEmail(user.email)}
                >
                  Send password reset email
                </Button>
              )}
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.25,
                p: 2,
                borderRadius: radii.lg,
                bgcolor: brand[50],
                border: `1px solid ${brand[200]}`,
              }}
            >
              <Info
                size={18}
                color={brand[600]}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: neutral[800],
                  }}
                >
                  No password set
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: neutral[600], mt: 0.25 }}
                >
                  You sign in with{" "}
                  {connectedProviders.length
                    ? connectedProviders.join(" and ")
                    : "a connected account"}
                  . Manage sign-in from that provider, or connect a password
                  login from the Connected Accounts tab.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Card>
    </Stack>
  );
}
