import { useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { CheckCircle2, Unlink } from "lucide-react";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ConfirmModal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUnlinkProvider } from "../../hooks/useAuth";
import { neutral, brand, radii, semantic } from "../../theme/tokens";

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#4285F4"
        d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.4 5.5-5 7.2v6h8.1c4.7-4.4 7.2-10.9 7.2-17.3z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-8.1-6c-2.2 1.5-5 2.4-7.8 2.4-6 0-11.1-4-12.9-9.4H2.8v6.2C6.8 42.6 14.9 48 24 48z"
      />
      <path
        fill="#FBBC04"
        d="M11.1 29.2c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6v-6.2H2.8C1 17.1 0 20.4 0 24s1 6.9 2.8 10.2l8.3-5z"
      />
      <path
        fill="#EA4335"
        d="M24 9.5c3.4 0 6.4 1.2 8.8 3.4l6.6-6.6C35.9 2.6 30.5 0 24 0 14.9 0 6.8 5.4 2.8 13.8l8.3 6.2C12.9 13.5 18 9.5 24 9.5z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 19 19" aria-hidden>
      <path
        fill="#08060d"
        fillRule="evenodd"
        d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844"
        clipRule="evenodd"
      />
    </svg>
  );
}

const PROVIDERS = [
  {
    key: "google",
    label: "Google",
    Icon: GoogleIcon,
    connectHref: "/api/auth/link/google",
  },
  {
    key: "github",
    label: "GitHub",
    Icon: GithubIcon,
    connectHref: "/api/auth/link/github",
  },
];

export default function ConnectedAccountsSection() {
  const user = useCurrentUser();
  const { mutate: unlinkProvider, isPending, variables } = useUnlinkProvider();
  const [pendingUnlink, setPendingUnlink] = useState(null);

  const linked = user?.linkedProviders ?? {};

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card variant="raised">
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.0625rem",
              color: neutral[800],
              mb: 0.5,
            }}
          >
            Connected accounts
          </Typography>
          <Typography variant="body2" sx={{ color: neutral[500], mb: 2.5 }}>
            Link a social account for faster sign-in, or disconnect one you no
            longer use.
          </Typography>

          <Stack spacing={1.5}>
            {PROVIDERS.map(({ key, label, Icon, connectHref }) => {
              const isConnected = Boolean(linked[key]);
              const isUnlinkingThis = isPending && variables === key;

              return (
                <Box
                  key={key}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    p: 2,
                    border: `1px solid ${neutral[200]}`,
                    borderRadius: radii.lg,
                    flexWrap: "wrap",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Icon />
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.9375rem",
                          color: neutral[800],
                        }}
                      >
                        {label}
                      </Typography>
                      {isConnected ? (
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <CheckCircle2
                            size={12}
                            color={semantic.success.base}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: semantic.success.text }}
                          >
                            Connected
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography
                          variant="caption"
                          sx={{ color: neutral[400] }}
                        >
                          Not connected
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  {isConnected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      startIcon={<Unlink size={14} />}
                      loading={isUnlinkingThis}
                      onClick={() => setPendingUnlink(key)}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      component="a"
                      href={connectHref}
                    >
                      Connect
                    </Button>
                  )}
                </Box>
              );
            })}
          </Stack>

          <Box
            sx={{
              mt: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              p: 2,
              border: `1px solid ${neutral[200]}`,
              borderRadius: radii.lg,
              bgcolor: neutral[50],
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: neutral[800],
                }}
              >
                Email &amp; password
              </Typography>
              <Typography variant="caption" sx={{ color: neutral[500] }}>
                {linked.local
                  ? "Password login is set up for this account."
                  : "No password set — you sign in via a connected account."}
              </Typography>
            </Box>
            <Badge tone={linked.local ? "success" : "neutral"} variant="soft">
              {linked.local ? "Active" : "Not set"}
            </Badge>
          </Box>
        </Box>
      </Card>

      <ConfirmModal
        open={Boolean(pendingUnlink)}
        onClose={() => setPendingUnlink(null)}
        onConfirm={() => {
          unlinkProvider(pendingUnlink, {
            onSuccess: () => setPendingUnlink(null),
          });
        }}
        loading={isPending}
        title={`Disconnect ${pendingUnlink === "google" ? "Google" : "GitHub"}?`}
        message="You'll need another way to sign in — a linked account or a password — before removing this one."
        confirmLabel="Disconnect"
        confirmVariant="danger"
      />
    </Stack>
  );
}
