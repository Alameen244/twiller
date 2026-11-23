import { useState } from "react";
import { Box, Dialog, IconButton, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../../i18n";
import { requestLanguageOtpApi, verifyLanguageOtpApi } from "../../Apis/authApi";
import LanguageOtpStep from "./LanguageOtpStep";
import { getPhoneErrorMessage } from "./phoneErrors";

export default function LanguageDialog({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState("pick");
  const [target, setTarget] = useState(null); // language code waiting for OTP
  const [otpInfo, setOtpInfo] = useState({ channel: "sms", maskedTarget: "" });
  const [busy, setBusy] = useState(false);
  const [otpKey, setOtpKey] = useState(0);

  const reset = () => {
    setStep("pick");
    setTarget(null);
    setOtpKey(0);
  };

  const handleClose = () => {
    if (busy) return;
    reset();
    onClose();
  };

  // Asks the backend to send the OTP. The language is NOT changed here.
  const requestOtp = async (code) => {
    setBusy(true);
    try {
      const res = await requestLanguageOtpApi(code);
      if (res.changed === false) {
        // Backend already has this language saved: just sync the screen.
        await i18n.changeLanguage(code);
        reset();
        onClose();
        return false;
      }
      setTarget(code);
      setOtpInfo({ channel: res.channel, maskedTarget: res.maskedTarget });
      setStep("otp");
      toast.success(t("language.otpSentToast"));
      return true;
    } catch (e) {
      toast.error(getPhoneErrorMessage(e), { toastId: "language-error" });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handlePick = (code) => {
    if (busy || code === i18n.language) return; // same language: nothing happens, no OTP
    requestOtp(code);
  };

  const handleResend = async () => {
    const ok = await requestOtp(target);
    if (ok) setOtpKey((k) => k + 1); // clear the boxes
    return ok;
  };

  // The language is applied on screen only after the backend confirms the OTP.
  const handleVerify = async (code) => {
    setBusy(true);
    try {
      const res = await verifyLanguageOtpApi(target, code);
      await i18n.changeLanguage(res.language);
      toast.success(t("language.changed"));
      reset();
      onClose();
    } catch (e) {
      toast.error(getPhoneErrorMessage(e), { toastId: "language-error" });
      setOtpKey((k) => k + 1); // clear and refocus the boxes
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          bgcolor: "#000",
          color: "#e7e9ea",
          borderRadius: 4,
          border: "1px solid #2f3336",
          backgroundImage: "none",
        },
      }}
    >
      <Box sx={{ p: 1 }}>
        <IconButton onClick={handleClose} sx={{ color: "#e7e9ea" }}>
          <Close />
        </IconButton>
      </Box>
      <Box sx={{ px: 4, pb: 4 }}>
        {step === "pick" ? (
          <Box>
            <Typography variant="h5" fontWeight={800} mb={1}>
              {t("language.chooseTitle")}
            </Typography>
            <Typography color="#71767b" mb={2}>
              {t("language.description")}
            </Typography>
            <List disablePadding>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isCurrent = lang.code === i18n.language;
                return (
                  <ListItemButton
                    key={lang.code}
                    disabled={busy}
                    onClick={() => handlePick(lang.code)}
                    sx={{
                      borderRadius: 2,
                      py: 1.25,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                    }}
                  >
                    <ListItemText
                      primary={lang.nativeName}
                      secondary={lang.name}
                      primaryTypographyProps={{ fontSize: 16, color: "#e7e9ea" }}
                      secondaryTypographyProps={{ fontSize: 13, color: "#71767b" }}
                    />
                    {isCurrent && <Check sx={{ color: "#1d9bf0" }} />}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ) : (
          <LanguageOtpStep
            channel={otpInfo.channel}
            maskedTarget={otpInfo.maskedTarget}
            onVerify={handleVerify}
            onResend={handleResend}
            onBack={reset}
            busy={busy}
            otpKey={otpKey}
          />
        )}
      </Box>
    </Dialog>
  );
}
