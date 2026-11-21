import { Box, Button, Stack, Typography } from "@mui/material";
import { Check, RadioButtonChecked } from "@mui/icons-material";
import { PLAN_BENEFITS, tweetLimitText } from "./plansConstants";

export default function PlanCard({
  plan,
  isCurrent,
  isOpenNow,
  payingPlan,
  onChoose,
}) {
  const isFree = plan.id === "free";
  const isPopular = plan.id === "silver";

  let buttonLabel = `Subscribe to ${plan.name}`;
  if (payingPlan === plan.id) buttonLabel = "Processing...";
  else if (isCurrent) buttonLabel = "Current plan";
  else if (!isOpenNow) buttonLabel = "Payments closed";

  return (
    <Box
      data-component="plan-card"
      data-plan={plan.id}
      sx={{
        bgcolor: isCurrent ? "rgba(29, 155, 240, 0.04)" : "#121417",
        border: "1px solid",
        borderColor: isCurrent ? "#1d9bf0" : "#2f3336",
        borderRadius: "18px",
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        transition: "all 0.2s ease",
        boxShadow: isCurrent ? "0 0 0 1px #1d9bf0" : "none",
        "&:hover": {
          borderColor: isCurrent ? "#1d9bf0" : "#536471",
          transform: "translateY(-3px)",
        },
      }}
    >
      <div>
        {/* Top row: Name & badges */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {isCurrent && (
              <RadioButtonChecked
                sx={{
                  color: "#1d9bf0",
                  fontSize: 20,
                  pointerEvents: "none",
                }}
              />
            )}
            <Typography fontSize={22} fontWeight={800} color="#ffffff">
              {plan.name}
            </Typography>
          </Stack>

          {isPopular && !isCurrent && (
            <Box
              sx={{
                bgcolor: "rgba(29, 155, 240, 0.15)",
                color: "#1d9bf0",
                px: 1.25,
                py: 0.35,
                borderRadius: "9999px",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Most popular
            </Box>
          )}

          {isCurrent && (
            <Box
              sx={{
                bgcolor: "rgba(29, 155, 240, 0.15)",
                color: "#1d9bf0",
                px: 1.25,
                py: 0.35,
                borderRadius: "9999px",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Active
            </Box>
          )}
        </Stack>

        {/* Price */}
        <Stack direction="row" alignItems="baseline" sx={{ my: 1.5 }}>
          <Typography fontSize={28} fontWeight={800} color="#ffffff">
            {isFree ? "₹0" : `₹${plan.priceInr}`}
          </Typography>
          <Typography component="span" fontSize={13} sx={{ color: "#71767b", ml: 0.75 }}>
            {isFree ? "" : "/ month"}
          </Typography>
        </Stack>

        {/* Action button */}
        {!isFree && (
          <Button
            fullWidth
            variant="contained"
            disabled={isCurrent || !isOpenNow || Boolean(payingPlan)}
            onClick={() => onChoose(plan)}
            sx={{
              mt: 1,
              mb: 1.5,
              borderRadius: "9999px",
              textTransform: "none",
              fontWeight: 800,
              fontSize: 15,
              py: 1.1,
              bgcolor: isCurrent
                ? "rgba(29, 155, 240, 0.08)"
                : isPopular
                  ? "#ffffff"
                  : "#1d9bf0",
              color: isCurrent
                ? "#1d9bf0"
                : isPopular
                  ? "#000000"
                  : "#ffffff",
              border: isCurrent ? "1px solid rgba(29, 155, 240, 0.4)" : "none",
              "&:hover": {
                bgcolor: isPopular ? "#e6e6e6" : "#1a8cd8",
              },
              "&.Mui-disabled": {
                bgcolor: isCurrent ? "rgba(29, 155, 240, 0.08)" : "#24272c",
                color: isCurrent ? "#1d9bf0" : "#71767b",
                border: isCurrent ? "1px solid rgba(29, 155, 240, 0.4)" : "none",
              },
            }}
          >
            {buttonLabel}
          </Button>
        )}

        {isFree && isCurrent && (
          <Button
            fullWidth
            disabled
            sx={{
              mt: 1,
              mb: 1.5,
              borderRadius: "9999px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: 15,
              py: 1.1,
              border: "1px solid rgba(29, 155, 240, 0.4)",
              bgcolor: "rgba(29, 155, 240, 0.08)",
              color: "#1d9bf0",
              "&.Mui-disabled": {
                color: "#1d9bf0",
                border: "1px solid rgba(29, 155, 240, 0.4)",
                bgcolor: "rgba(29, 155, 240, 0.08)",
              },
            }}
          >
            Your current plan
          </Button>
        )}

        {isFree && !isCurrent && (
          <Button
            fullWidth
            disabled
            sx={{
              mt: 1,
              mb: 1.5,
              borderRadius: "9999px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: 15,
              py: 1.1,
              bgcolor: "#24272c",
              color: "#71767b",
              "&.Mui-disabled": {
                bgcolor: "#24272c",
                color: "#71767b",
              },
            }}
          >
            Free Tier
          </Button>
        )}

        {/* Tweet limit */}
        <Typography fontSize={13} sx={{ color: "#e7e9ea", mb: 2, fontWeight: 500 }}>
          {tweetLimitText(plan.tweetLimit)}
        </Typography>

        {/* Divider */}
        <Box sx={{ borderBottom: "1px solid #24272c", mb: 2 }} />

        {/* Features list */}
        <Stack spacing={1.2}>
          <Typography
            fontSize={11}
            fontWeight={700}
            color="#71767b"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Benefits
          </Typography>
          {PLAN_BENEFITS[plan.id]?.map((feature) => (
            <Stack key={feature} direction="row" alignItems="flex-start" spacing={1}>
              <Check
                sx={{
                  fontSize: 16,
                  color: "#1d9bf0",
                  mt: 0.2,
                  flexShrink: 0,
                }}
              />
              <Typography fontSize={13} color="#d9d9d9" sx={{ lineHeight: 1.4 }}>
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </div>
    </Box>
  );
}
