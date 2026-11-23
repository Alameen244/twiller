import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { pillButtonSx } from "./settingsStyles";

export default function PhoneNumberStep({ countryCode, digits, onChange, onSubmit, busy }) {
  const { t } = useTranslation();
  const valid = digits.length === 10;

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && !busy) onSubmit();
      }}
    >
      <Typography variant="h5" fontWeight={800} mb={1}>
        {t("account.addMobileTitle")}
      </Typography>
      <Typography color="#71767b" mb={3}>
        {t("account.addMobileDesc")}
      </Typography>
      <TextField
        fullWidth
        autoFocus
        placeholder={t("account.mobilePlaceholder")}
        value={digits}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
        inputProps={{ inputMode: "numeric" }}
        InputProps={{
          startAdornment: <InputAdornment position="start">{countryCode}</InputAdornment>,
        }}
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            color: "#e7e9ea",
            "& fieldset": { borderColor: "#333639" },
            "&:hover fieldset": { borderColor: "#536471" },
            "&.Mui-focused fieldset": { borderColor: "#1d9bf0" },
          },
          "& .MuiInputAdornment-root": { color: "#71767b" },
        }}
      />
      <Button type="submit" fullWidth disabled={!valid || busy} sx={{ ...pillButtonSx, py: 1.5 }}>
        {busy ? t("account.sending") : t("account.sendCode")}
      </Button>
    </Box>
  );
}
