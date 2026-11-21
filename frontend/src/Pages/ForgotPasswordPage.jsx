import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack, Typography } from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import { toast } from "react-toastify";
import TwitterLogo from "../Components/TwitterLogo";
import { Button } from "../Components/UI";
import ForgotPasswordRequestStep from "../Components/ForgotPassword/ForgotPasswordRequestStep";
import ForgotPasswordResetStep from "../Components/ForgotPassword/ForgotPasswordResetStep";
import { forgotPasswordRequestApi, forgotPasswordResetApi } from "../Apis/authApi";
import { getPhoneErrorMessage } from "../Components/Settings/phoneErrors";

const COUNTRY_CODE = "+91";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("request"); // request -> reset -> done
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState("");
  const [busy, setBusy] = useState(false);

  const buildPayload = () =>
    method === "email"
      ? { method, email: email.trim() }
      : { method, phoneNumber: `${COUNTRY_CODE}${digits}` };

  const target = method === "email" ? email.trim() : `${COUNTRY_CODE} ${digits}`;

  const showError = (e) => {
    const message = getPhoneErrorMessage(e);
    // 429 covers both the "one time per day" rule and the rate limit
    if (e?.response?.status === 429) toast.warning(message, { toastId: "forgot-error" });
    else toast.error(message, { toastId: "forgot-error" });
  };

  const handleSendOtp = async () => {
    setBusy(true);
    try {
      await forgotPasswordRequestApi(buildPayload());
      toast.success(method === "email" ? "OTP sent to your email." : "OTP sent to your phone.");
      setStep("reset");
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setBusy(true);
    try {
      await forgotPasswordRequestApi(buildPayload());
      toast.success("A new OTP was sent.");
      return true;
    } catch (e) {
      showError(e);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async (code, newPassword) => {
    setBusy(true);
    try {
      await forgotPasswordResetApi({ ...buildPayload(), code, newPassword });
      setStep("done");
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000",
        color: "#e7e9ea",
        display: "grid",
        placeItems: "center",
        p: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 440 }}>
        <Stack alignItems="center" spacing={3}>
          <TwitterLogo size={40} />

          <Box sx={{ width: "100%" }}>
            {step === "request" && (
              <ForgotPasswordRequestStep
                method={method}
                onMethodChange={setMethod}
                email={email}
                onEmailChange={setEmail}
                digits={digits}
                onDigitsChange={setDigits}
                countryCode={COUNTRY_CODE}
                onSubmit={handleSendOtp}
                busy={busy}
              />
            )}

            {step === "reset" && (
              <ForgotPasswordResetStep
                target={target}
                onReset={handleReset}
                onResend={handleResend}
                onBack={() => setStep("request")}
                busy={busy}
              />
            )}

            {step === "done" && (
              <Stack spacing={2} alignItems="center" textAlign="center">
                <CheckCircleOutline sx={{ fontSize: 56, color: "#00ba7c" }} />
                <Typography variant="h5" fontWeight={800}>
                  Password reset
                </Typography>
                <Typography color="#71767b">
                  Your password was changed. Sign in with your new password.
                </Typography>
                <Button
                  fullWidth
                  onClick={() => navigate("/")}
                  sx={{
                    bgcolor: "#1d9bf0",
                    color: "#fff",
                    fontWeight: 700,
                    py: 1.5,
                    "&:hover": { bgcolor: "#1a8cd8" },
                  }}
                >
                  Go to sign in
                </Button>
              </Stack>
            )}
          </Box>

          {step !== "done" && (
            <Button onClick={() => navigate("/")} sx={{ color: "#1d9bf0", fontWeight: 700 }}>
              Back to sign in
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
