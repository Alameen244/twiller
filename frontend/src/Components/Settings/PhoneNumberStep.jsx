import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { pillButtonSx } from "./settingsStyles";

export default function PhoneNumberStep({ countryCode, digits, onChange, onSubmit, busy }) {
  const valid = digits.length === 10;

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && !busy) onSubmit();
      }}
    >
      <Typography variant="h5" fontWeight={800} mb={1}>Add your mobile number</Typography>
      <Typography color="#71767b" mb={3}>
        We'll send a 6-digit code to verify it.
      </Typography>
      <TextField
        fullWidth
        autoFocus
        placeholder="Mobile number"
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
        {busy ? "Sending..." : "Send code"}
      </Button>
    </Box>
  );
}
