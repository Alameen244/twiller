import { useState } from "react";
import { Box, Dialog, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useAuth } from "../../Context/AuthContext";
import PhoneNumberStep from "./PhoneNumberStep";
import PhoneOtpStep from "./PhoneOtpStep";
import { getPhoneErrorMessage } from "./phoneErrors";

const COUNTRY_CODE = "+91";

export default function PhoneVerifyDialog({ open, onClose }) {
  const { sendPhoneOtp, verifyPhoneOtp, cancelPhoneFlow } = useAuth();
  const [step, setStep] = useState("phone");
  const [digits, setDigits] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpKey, setOtpKey] = useState(0);

  const reset = () => {
    setStep("phone");
    setDigits("");
    setOtpKey(0);
  };

  const handleClose = () => {
    if (busy) return;
    cancelPhoneFlow();
    reset();
    onClose();
  };

  const handleSend = async () => {
    setBusy(true);
    try {
      await sendPhoneOtp(`${COUNTRY_CODE}${digits}`);
      setStep("otp");
      toast.success("Verification code sent.");
      return true;
    } catch (e) {
      toast.error(getPhoneErrorMessage(e), { toastId: "phone-error" });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    const ok = await handleSend();
    if (ok) setOtpKey((k) => k + 1); // clear the boxes
    return ok;
  };

  const handleVerify = async (code) => {
    setBusy(true);
    try {
      await verifyPhoneOtp(code);
      toast.success("Mobile number verified.");
      reset();
      onClose();
    } catch (e) {
      toast.error(getPhoneErrorMessage(e), { toastId: "phone-error" });
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
        {step === "phone" ? (
          <PhoneNumberStep
            countryCode={COUNTRY_CODE}
            digits={digits}
            onChange={setDigits}
            onSubmit={handleSend}
            busy={busy}
          />
        ) : (
          <PhoneOtpStep
            phone={`${COUNTRY_CODE} ${digits}`}
            onVerify={handleVerify}
            onResend={handleResend}
            busy={busy}
            otpKey={otpKey}
          />
        )}
      </Box>
    </Dialog>
  );
}
