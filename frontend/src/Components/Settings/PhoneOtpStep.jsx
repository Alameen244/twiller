import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import OtpInput from "../UI/OtpInput";

const RESEND_SECONDS = 30;

export default function PhoneOtpStep({ phone, onVerify, onResend, busy, otpKey }) {
  const [secs, setSecs] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secs <= 0) return undefined;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const handleResend = async () => {
    if (await onResend()) setSecs(RESEND_SECONDS);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={1}>We sent you a code</Typography>
      <Typography color="#71767b" mb={3}>Enter it below to verify {phone}.</Typography>

      <OtpInput key={otpKey} length={6} onOtpSubmit={onVerify} disabled={busy} />

      <Box sx={{ minHeight: 24, mt: 2, textAlign: "center" }}>
        {busy && (
          <Typography fontSize={14} color="#71767b">Verifying...</Typography>
        )}
      </Box>

      <Box sx={{ textAlign: "center", mt: 1 }}>
        <Button
          onClick={handleResend}
          disabled={secs > 0 || busy}
          sx={{ textTransform: "none", color: "#1d9bf0", "&.Mui-disabled": { color: "#71767b" } }}
        >
          {secs > 0 ? `Resend code in ${secs}s` : "Resend code"}
        </Button>
      </Box>
    </Box>
  );
}
