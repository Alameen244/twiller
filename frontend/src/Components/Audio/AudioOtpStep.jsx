import { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Button } from "../UI";
import OtpInput from "../UI/OtpInput";

const RESEND_COOLDOWN_SECONDS = 30;

export default function AudioOtpStep({ maskedEmail, onVerify, onResend, onBack, busy, otpKey }) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    const ok = await onResend();
    if (ok) setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <Box>
      <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 1 }}>Verify it's you</Typography>
      <Typography sx={{ fontSize: 14, color: "#71767b", mb: 3, lineHeight: 1.5 }}>
        Enter the 6-digit code we sent to {maskedEmail}. Your audio is uploaded right after the
        code is verified.
      </Typography>

      <OtpInput key={otpKey} length={6} onOtpSubmit={onVerify} disabled={busy} />

      <Stack spacing={1} alignItems="center" sx={{ mt: 3 }}>
        <Button
          onClick={handleResend}
          disabled={busy || cooldown > 0}
          sx={{
            color: "#1d9bf0",
            fontWeight: 700,
            bgcolor: "transparent",
            "&.Mui-disabled": { color: "#71767b" },
          }}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </Button>
        <Button
          onClick={onBack}
          disabled={busy}
          sx={{ color: "#e7e9ea", fontWeight: 700, bgcolor: "transparent" }}
        >
          Back
        </Button>
      </Stack>
    </Box>
  );
}
