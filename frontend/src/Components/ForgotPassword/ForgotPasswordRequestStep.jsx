import { Box, InputAdornment, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Button, Input } from "../UI";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const tabSx = {
  textTransform: "none",
  fontWeight: 700,
  color: "#71767b",
  "&.Mui-selected": { color: "#e7e9ea" },
};

export default function ForgotPasswordRequestStep({
  method,
  onMethodChange,
  email,
  onEmailChange,
  digits,
  onDigitsChange,
  countryCode,
  onSubmit,
  busy,
  titleText,
  subtitleText,
  emailDisabled = false,
  phoneDisabled = false,
}) {
  const { t } = useTranslation();
  const valid = method === "email" ? EMAIL_FORMAT.test(email.trim()) : digits.length === 10;

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && !busy) onSubmit();
      }}
    >
      <Typography variant="h5" fontWeight={800} mb={1}>
        {titleText || t("forgot.title")}
      </Typography>
      <Typography color="#71767b" mb={3}>
        {subtitleText || t("forgot.chooseWhere")}
      </Typography>

      <Tabs
        value={method}
        onChange={(_, value) => onMethodChange(value)}
        variant="fullWidth"
        textColor="inherit"
        sx={{
          mb: 3,
          borderBottom: "1px solid #2f3336",
          "& .MuiTabs-indicator": { bgcolor: "#1d9bf0" },
        }}
      >
        <Tab value="email" label={t("forgot.emailTab")} sx={tabSx} />
        <Tab value="phone" label={t("forgot.phoneTab")} sx={tabSx} />
      </Tabs>

      {method === "email" ? (
        <Input
          autoFocus={!emailDisabled}
          disabled={emailDisabled}
          type="email"
          placeholder={t("forgot.emailPlaceholder")}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      ) : (
        <TextField
          fullWidth
          autoFocus={!phoneDisabled}
          disabled={phoneDisabled}
          placeholder={t("forgot.phonePlaceholder")}
          value={digits}
          onChange={(e) => onDigitsChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
          inputProps={{ inputMode: "numeric" }}
          InputProps={{
            startAdornment: <InputAdornment position="start">{countryCode}</InputAdornment>,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#e7e9ea",
              "& fieldset": { borderColor: "#333639" },
              "&:hover fieldset": { borderColor: "#536471" },
              "&.Mui-focused fieldset": { borderColor: "#1d9bf0" },
              "&.Mui-disabled input": { WebkitTextFillColor: "#9a9a9a" },
            },
            "& .MuiInputAdornment-root": { color: "#71767b" },
          }}
        />
      )}

      <Typography fontSize={13} color="#71767b" mt={1} mb={3}>
        {method === "email" ? t("forgot.emailHint") : t("forgot.phoneHint")}
      </Typography>

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
        {busy ? t("forgot.sending") : t("forgot.sendOtp")}
      </Button>
    </Box>
  );
}
