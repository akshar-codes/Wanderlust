import { useState, useEffect } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { ShieldCheck, Loader2 } from "lucide-react";
import { authService } from "../../services/auth.service";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { neutral, brand } from "../../theme/tokens";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/auth.store";

export default function TwoFactorSetup() {
  const { user, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showDisableToken, setShowDisableToken] = useState(false);

  const isEnabled = user?.settings?.twoFactorEnabled;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const data = await authService.generate2fa();
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
    } catch (err) {
      toast.error(err.message || "Failed to generate 2FA secret");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (!token) return toast.error("Please enter the code from your app");
    try {
      setLoading(true);
      const data = await authService.enable2fa({ secret, token });
      setRecoveryCodes(data.recoveryCodes);
      toast.success(data.message || "2FA enabled!");
      await refreshUser();
      setQrCodeUrl("");
      setSecret("");
      setToken("");
    } catch (err) {
      toast.error(err.message || "Invalid token");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!token) return toast.error("Please enter the code from your app");
    try {
      setLoading(true);
      const data = await authService.disable2fa({ token });
      toast.success(data.message || "2FA disabled");
      await refreshUser();
      setShowDisableToken(false);
      setToken("");
    } catch (err) {
      toast.error(err.message || "Invalid token");
    } finally {
      setLoading(false);
    }
  };

  const generateRecoveryCodes = async () => {
    if (!token) return toast.error("Please enter the code from your app to generate recovery codes");
    try {
      setLoading(true);
      const data = await authService.generateRecoveryCodes({ token });
      setRecoveryCodes(data.recoveryCodes);
      toast.success("Recovery codes generated. Save them safely.");
      setToken("");
    } catch (err) {
      toast.error(err.message || "Invalid token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2.5, sm: 3 }, borderTop: `1px solid ${neutral[200]}` }}>
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
        <ShieldCheck size={18} color={brand[500]} />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1.0625rem",
            color: neutral[800],
          }}
        >
          Two-factor authentication
        </Typography>
      </Stack>

      <Typography variant="body2" sx={{ color: neutral[600], mb: 3 }}>
        Protect your account by requiring an extra step when signing in.
      </Typography>

      {!isEnabled && !qrCodeUrl && (
        <Button variant="primary" onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Set up 2FA"}
        </Button>
      )}

      {qrCodeUrl && (
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Typography variant="body2" sx={{ color: neutral[800], fontWeight: 500 }}>
            1. Scan this QR code with your authenticator app
          </Typography>
          <img src={qrCodeUrl} alt="2FA QR Code" style={{ width: 200, height: 200 }} />
          
          <Typography variant="body2" sx={{ color: neutral[800], fontWeight: 500, mt: 2 }}>
            2. Enter the 6-digit code
          </Typography>
          <Input
            placeholder="000000"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Stack direction="row" spacing={2}>
            <Button variant="primary" onClick={handleEnable} disabled={loading || !token}>
              Verify and Enable
            </Button>
            <Button variant="ghost" onClick={() => setQrCodeUrl("")} disabled={loading}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      )}

      {isEnabled && recoveryCodes.length === 0 && !showDisableToken && (
        <Stack spacing={2} direction="row">
          <Button variant="ghost" onClick={() => setShowDisableToken(true)} disabled={loading}>
            Disable 2FA
          </Button>
        </Stack>
      )}

      {isEnabled && showDisableToken && (
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
           <Typography variant="body2" sx={{ color: neutral[800], fontWeight: 500 }}>
            Enter a 6-digit code to disable 2FA
          </Typography>
          <Input
            placeholder="000000"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Stack direction="row" spacing={2}>
             <Button variant="primary" onClick={handleDisable} disabled={loading || !token}>
              Disable
            </Button>
            <Button variant="ghost" onClick={() => {setShowDisableToken(false); setToken("");}} disabled={loading}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      )}

      {recoveryCodes.length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "#fff3cd", borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "#856404", fontWeight: 700, mb: 1 }}>
            Save your recovery codes
          </Typography>
          <Typography variant="body2" sx={{ color: "#856404", mb: 2 }}>
            If you lose your device, you can use these recovery codes to access your account. These codes will only be shown once.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {recoveryCodes.map((code) => (
              <Box key={code} sx={{ fontFamily: "monospace", bgcolor: "#fff", px: 1, py: 0.5, borderRadius: 1, border: "1px solid #ffeeba" }}>
                {code}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
