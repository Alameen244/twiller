import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function PaymentWindowNotice({ isOpenNow, label }) {
  const { t } = useTranslation();
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
          ? t("plans.paymentsOpen")
          : t("plans.paymentsClosed")}
      </Typography>
      <Typography
        fontSize={13}
        sx={{ color: "#71767b", mt: 0.5, lineHeight: 1.5 }}
      >
        {t("plans.windowNotice", { label })}
      </Typography>
    </Box>
  );
}
