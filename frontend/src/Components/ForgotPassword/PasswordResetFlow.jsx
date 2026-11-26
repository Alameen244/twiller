import { useState } from "react";
import { Stack, Typography } from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Button } from "../UI";
import ForgotPasswordRequestStep from "./ForgotPasswordRequestStep";
import ForgotPasswordResetStep from "./ForgotPasswordResetStep";
import { forgotPasswordRequestApi, forgotPasswordResetApi } from "../../Apis/authApi";
import { getPhoneErrorMessage } from "../Settings/phoneErrors";

const COUNTRY_CODE = "+91";

/**
 * Shared 3-step OTP verification & password reset flow reused by both
 * signed-out ForgotPasswordPage and signed-in SettingsResetPasswordPage.
 */
export default function PasswordResetFlow({
  initialEmail = "",
  initialDigits = "",
  lockEmail = false,
  lockPhone = false,
  requestTitle,
  requestSubtitle,
  doneTitle,
  doneDesc,
  doneButtonLabel,
  onDoneAction,
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState("request"); // request -> reset -> done
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState(initialDigits);
  const [busy, setBusy] = useState(false);

  const buildPayload = () =>
    method === "email"
      ? { method, email: email.trim() }
      : { method, phoneNumber: `${COUNTRY_CODE}${digits}` };

  const target = method === "email" ? email.trim() : `${COUNTRY_CODE} ${digits}`;

  const showError = (e) => {
    const message = getPhoneErrorMessage(e, t);
    // 429 covers both the "one time per day" rule and the rate limit
    if (e?.response?.status === 429) toast.warning(message, { toastId: "forgot-error" });
    else toast.error(message, { toastId: "forgot-error" });
  };

  const handleSendOtp = async () => {
    setBusy(true);
    try {
      await forgotPasswordRequestApi(buildPayload());
      toast.success(method === "email" ? t("forgot.otpSentEmail") : t("forgot.otpSentPhone"));
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
      toast.success(t("forgot.newOtpSent"));
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

  if (step === "request") {
    return (
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
        titleText={requestTitle}
        subtitleText={requestSubtitle}
        emailDisabled={lockEmail}
        phoneDisabled={lockPhone}
      />
    );
  }

  if (step === "reset") {
    return (
      <ForgotPasswordResetStep
        target={target}
        onReset={handleReset}
        onResend={handleResend}
        onBack={() => setStep("request")}
        busy={busy}
      />
    );
  }

  return (
    <Stack spacing={2} alignItems="center" textAlign="center">
      <CheckCircleOutline sx={{ fontSize: 56, color: "#00ba7c" }} />
      <Typography variant="h5" fontWeight={800}>
        {doneTitle || t("forgot.resetSuccessTitle")}
      </Typography>
      <Typography color="#71767b">
        {doneDesc || t("forgot.resetSuccessDesc")}
      </Typography>
      <Button
        fullWidth
        onClick={onDoneAction}
        sx={{
          bgcolor: "#1d9bf0",
          color: "#fff",
          fontWeight: 700,
          py: 1.5,
          "&:hover": { bgcolor: "#1a8cd8" },
        }}
      >
        {doneButtonLabel || t("forgot.goToSignIn")}
      </Button>
    </Stack>
  );
}
