import { Box, Typography } from "@mui/material";

export default function PaymentWindowNotice({ isOpenNow, label }) {
  return (
    <Box
      data-component="payment-window-notice"
      sx={{
        flex: 1,
        p: 2,
        borderRadius: "14px",
        border: "1px solid",
        borderColor: isOpenNow
          ? "rgba(0,186,124,0.4)"
          : "rgba(244,33,46,0.4)",
        bgcolor: isOpenNow
          ? "rgba(0,186,124,0.06)"
          : "rgba(244,33,46,0.06)",
      }}
    >
      <Typography
        fontWeight={700}
        fontSize={15}
        sx={{ color: isOpenNow ? "#00ba7c" : "#f4212e" }}
      >
        {isOpenNow
          ? "● Payments are open right now"
          : "● Payments are closed right now"}
      </Typography>
      <Typography
        fontSize={13}
        sx={{ color: "#71767b", mt: 0.5, lineHeight: 1.5 }}
      >
        Payments are accepted only between {label}. Any payment attempt outside
        this time is blocked.
      </Typography>
    </Box>
  );
}
