import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatDate } from "./plansConstants";

export default function CurrentPlanSummary({ mySub }) {
  const { t, i18n } = useTranslation();
  if (!mySub) return null;

  const usageText =
    mySub.tweetLimit === null
      ? t("plans.unlimitedTweetsPosted", { used: mySub.tweetsUsed })
      : `${t("plans.tweetsUsedOfLimit", {
          used: Math.min(mySub.tweetsUsed, mySub.tweetLimit),
          limit: mySub.tweetLimit,
        })}${mySub.tweetsUsed >= mySub.tweetLimit ? ` · ${t("plans.limitReached")}` : ""}`;

  const validText = mySub.expiresAt
    ? ` · ${t("plans.validUntil", { date: formatDate(mySub.expiresAt, i18n.language) })}`
    : "";

  return (
    <Box
      data-component="current-plan-summary"
      sx={{
        flex: 1,
        p: 2,
        borderRadius: "14px",
        bgcolor: "#121417",
        border: "1px solid #2f3336",
      }}
    >
      <Typography
        fontSize={12}
        sx={{
          color: "#71767b",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {t("plans.yourCurrentPlan")}
      </Typography>
      <Typography fontSize={20} fontWeight={800} sx={{ mt: 0.25 }}>
        {mySub.planName}
      </Typography>
      <Typography fontSize={13} sx={{ color: "#e7e9ea", mt: 0.5 }}>
        {usageText}
        {validText}
      </Typography>
    </Box>
  );
}
