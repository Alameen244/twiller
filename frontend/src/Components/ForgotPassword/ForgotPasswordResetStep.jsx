import { useEffect, useState } from "react";
import { Box, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { ContentCopy, Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Button } from "../UI";
import { generateLettersPassword } from "../../helper/passwordGenerator";

const RESEND_SECONDS = 30;
const MIN_PASSWORD_LENGTH = 8;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#e7e9ea",
    "& fieldset": { borderColor: "#333639" },
    "&:hover fieldset": { borderColor: "#536471" },
    "&.Mui-focused fieldset": { borderColor: "#1d9bf0" },
  },
  "& .MuiInputAdornment-root": { color: "#71767b" },
};

export default function ForgotPasswordResetStep({ target, onReset, onResend, onBack, busy }) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [secs, setSecs] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secs <= 0) return undefined;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;
  const valid =
    /^\d{6}$/.test(code) && password.length >= MIN_PASSWORD_LENGTH && password === confirm;

  const handleGenerate = () => {
    const generated = generateLettersPassword();
    setPassword(generated);
    setConfirm(generated);
    setShow(true); // show it so the user can read and copy it
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success(t("forgot.passwordCopied"), { toastId: "password-copied" });
    } catch {
      toast.error(t("forgot.couldNotCopy"));
    }
  };

  const handleResend = async () => {
    if (await onResend()) {
      setSecs(RESEND_SECONDS);
      setCode("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (valid && !busy) onReset(code, password);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" fontWeight={800} mb={1}>
        {t("forgot.resetTitle")}
      </Typography>
      <Typography color="#71767b" mb={3}>
        {t("forgot.resetDesc", { target })}
      </Typography>

      <Stack spacing={2}>
        <TextField
          fullWidth
          autoFocus
          placeholder={t("forgot.codePlaceholder")}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputProps={{ inputMode: "numeric", autoComplete: "one-time-code" }}
          sx={{ ...fieldSx, "& input": { letterSpacing: "0.4em", fontWeight: 700 } }}
        />

        <TextField
          fullWidth
          placeholder={t("forgot.newPasswordPlaceholder")}
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={tooShort}
          helperText={tooShort ? t("forgot.atLeastChars") : " "}
          inputProps={{ autoComplete: "new-password" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShow((s) => !s)}
                  edge="end"
                  aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")}
                  sx={{ color: "#71767b" }}
                >
                  {show ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />

        <TextField
          fullWidth
          placeholder={t("forgot.confirmPasswordPlaceholder")}
          type={show ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={mismatch}
          helperText={mismatch ? t("forgot.passwordsDontMatch") : " "}
          inputProps={{ autoComplete: "new-password" }}
          sx={fieldSx}
        />
      </Stack>

      <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" useFlexGap>
        <Button
          onClick={handleGenerate}
          disabled={busy}
          variant="outlined"
          sx={{ color: "#1d9bf0", borderColor: "#1d9bf0", fontWeight: 700, px: 2 }}
        >
          {t("forgot.generatePassword")}
        </Button>
        <Button
          onClick={handleCopy}
          disabled={busy || !password}
          variant="outlined"
          startIcon={<ContentCopy fontSize="small" />}
          sx={{
            color: "#e7e9ea",
            borderColor: "#536471",
            px: 2,
            "&.Mui-disabled": { color: "#71767b", borderColor: "#333639" },
          }}
        >
          {t("forgot.copy")}
        </Button>
      </Stack>

      <Button
        type="submit"
        fullWidth
        disabled={!valid || busy}
        sx={{
          bgcolor: "#1d9bf0",
          color: "#fff",
          fontWeight: 700,
          py: 1.5,
          "&:hover": { bgcolor: "#1a8cd8" },
          "&.Mui-disabled": { bgcolor: "#1d9bf0", color: "#fff", opacity: 0.5 },
        }}
      >
        {busy ? t("forgot.resetting") : t("forgot.resetPassword")}
      </Button>

      <Stack direction="row" justifyContent="space-between" mt={2}>
        <Button onClick={onBack} disabled={busy} sx={{ color: "#1d9bf0" }}>
          {t("forgot.changeDetails")}
        </Button>
        <Button
          onClick={handleResend}
          disabled={secs > 0 || busy}
          sx={{ color: "#1d9bf0", "&.Mui-disabled": { color: "#71767b" } }}
        >
          {secs > 0 ? t("forgot.resendIn", { secs }) : t("forgot.resend")}
        </Button>
      </Stack>
    </Box>
  );
}
