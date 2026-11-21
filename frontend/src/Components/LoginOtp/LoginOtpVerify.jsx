import { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { toast } from "react-toastify";
import OtpInput from "../UI/OtpInput";
import { Button } from "../UI";
import TwitterLogo from "../TwitterLogo";
import { useAuth } from "../../Context/AuthContext";

const RESEND_COOLDOWN_SECONDS = 30;
const getMessage = (err, fallback) => err?.response?.data?.message || fallback;

export default function LoginOtpVerify() {
  const {
    pendingLogin,
    verifyLoginOtp,
    resendLoginOtp,
    cancelLoginVerification,
    googlesignin,
  } = useAuth();
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0); // changing the key clears the 6 boxes
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submit = async (code) => {
    setBusy(true);
    try {
      await verifyLoginOtp(code); // on success this screen unmounts
      toast.success("Login verified");
    } catch (err) {
      toast.error(getMessage(err, "Could not verify the code."));
      setResetKey((k) => k + 1);
      setBusy(false);
    }
  };

  // Opens the Google account chooser. If the user picks an account, the full login checks run again
  // for it (a new OTP is sent if it's Chrome). If the popup is closed, we stay on this screen.
  const switchAccount = async () => {
    try {
      await googlesignin(); // a second click cancels the earlier popup (Firebase handles this)
      setResetKey((k) => k + 1);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      // googlesignin already showed a toast for real errors; closing the popup is not an error
    }
  };
  const resend = async () => {
    try {
      await resendLoginOtp();
      toast.success("A new code was sent to your email.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setResetKey((k) => k + 1);
    } catch (err) {
      toast.error(getMessage(err, "Could not resend the code."));
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="grid"
      sx={{ placeItems: "center", bgcolor: "#000", color: "#fff", p: 2 }}
    >
      <Stack
        alignItems="center"
        spacing={3}
        sx={{ maxWidth: 420, textAlign: "center" }}
      >
        <TwitterLogo size={50} />
        <Typography variant="h5" fontWeight={700}>
          Verify it&apos;s you
        </Typography>
        <Typography color="text.secondary">
          Because you signed in from Google Chrome, we sent a 6-digit code to{" "}
          <strong>{pendingLogin?.maskedEmail}</strong>. It is valid for 10
          minutes.
        </Typography>
        <OtpInput
          key={resetKey}
          length={6}
          onOtpSubmit={submit}
          disabled={busy}
        />
        <Button
          type="button"
          onClick={resend}
          disabled={busy || cooldown > 0}
          sx={{ color: "#1d9bf0", fontWeight: 700 }}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </Button>
        <Button
          type="button"
          onClick={switchAccount}
          sx={{ color: "#1d9bf0", fontWeight: 700 }}
        >
          Use a different Google account
        </Button>
        <Button
          type="button"
          onClick={cancelLoginVerification}
          disabled={busy}
          sx={{ color: "#71767b", fontWeight: 700 }}
        >
          Back to sign in
        </Button>
      </Stack>
    </Box>
  );
}
