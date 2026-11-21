import { Box, Typography } from "@mui/material";
import { formatDate } from "./plansConstants";

export default function CurrentPlanSummary({ mySub }) {
  if (!mySub) return null;

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
        Your current plan
      </Typography>
      <Typography fontSize={20} fontWeight={800} sx={{ mt: 0.25 }}>
        {mySub.planName}
      </Typography>
      <Typography fontSize={13} sx={{ color: "#e7e9ea", mt: 0.5 }}>
        {mySub.tweetLimit === null
          ? `${mySub.tweetsUsed} tweets posted (unlimited)`
          : `${Math.min(mySub.tweetsUsed, mySub.tweetLimit)} of ${mySub.tweetLimit} tweets used${
              mySub.tweetsUsed >= mySub.tweetLimit ? " · limit reached" : ""
            }`}
        {mySub.expiresAt ? ` · valid until ${formatDate(mySub.expiresAt)}` : ""}
      </Typography>
    </Box>
  );
}
