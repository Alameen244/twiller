import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import AllInclusive from "@mui/icons-material/AllInclusive";
import { useNavigate } from "react-router-dom";
import { getMySubscriptionApi } from "../Apis/subscriptionApi";

const TRACK = "#2f3336";

// Blue normally, yellow when 80% used, red when the limit is reached.
const colorFor = (percent) => {
  if (percent >= 100) return "#f4212e";
  if (percent >= 80) return "#ffd400";
  return "#1d9bf0";
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// A grey track with a coloured arc on top, optional content in the middle.
function Ring({ size, thickness, percent, color, children }) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex", width: size, height: size }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ color: TRACK }}
      />
      <CircularProgress
        variant="determinate"
        value={percent}
        size={size}
        thickness={thickness}
        sx={{
          color,
          position: "absolute",
          left: 0,
          top: 0,
          "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
        }}
      />
      {children && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}

// Small ring or badge button for the tweet composer. Click it to see tweet usage.
// refreshKey: change it (e.g. after posting a tweet) to reload the numbers.
export default function UsageIndicator({ refreshKey = 0 }) {
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const load = useCallback(() => {
    getMySubscriptionApi()
      .then(setSub)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const unlimited = sub?.tweetLimit === null;
  const isGold = sub?.plan === "gold" || unlimited;
  const used = !sub
    ? 0
    : unlimited
    ? sub.tweetsUsed
    : Math.min(sub.tweetsUsed, sub.tweetLimit);
  const percent = !sub || unlimited ? 0 : Math.min((used / sub.tweetLimit) * 100, 100);
  const color = colorFor(percent);
  const remaining = sub && !unlimited ? Math.max(sub.tweetLimit - sub.tweetsUsed, 0) : null;

  let statusText = "";
  if (sub) {
    if (unlimited) statusText = "Unlimited tweets on your plan";
    else if (remaining === 0) statusText = "You have reached your limit";
    else statusText = `${remaining} tweet${remaining === 1 ? "" : "s"} left`;
  }

  return (
    <>
      {isGold ? (
        <Tooltip title={`Gold Member · Unlimited tweets (${used} posted)`}>
          <IconButton
            data-component="usage-button"
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              load();
            }}
            sx={{
              p: 0.5,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255, 215, 0, 0.12)",
                boxShadow: "0 0 10px rgba(255, 215, 0, 0.35)",
              },
            }}
          >
            <Ring size={24} thickness={3} percent={100} color="#ffd700">
              <AllInclusive
                sx={{
                  fontSize: 14,
                  color: "#ffd700",
                }}
              />
            </Ring>
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="View usage">
          <IconButton
            data-component="usage-button"
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              load(); // always show fresh numbers when opened
            }}
            sx={{
              p: 0.5,
              px: sub ? 1 : 0.75,
              borderRadius: 99,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              bgcolor: percent >= 100 ? "rgba(244, 33, 46, 0.1)" : "transparent",
              border:
                percent >= 100
                  ? "1px solid rgba(244, 33, 46, 0.25)"
                  : "1px solid transparent",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor:
                  percent >= 100
                    ? "rgba(244, 33, 46, 0.18)"
                    : "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            <Ring size={22} thickness={4} percent={percent} color={color} />
            {sub && (
              <Typography
                fontSize={12}
                fontWeight={700}
                sx={{
                  color,
                  lineHeight: 1,
                  letterSpacing: "0.2px",
                }}
              >
                {`${used}/${sub.tweetLimit}`}
              </Typography>
            )}
          </IconButton>
        </Tooltip>
      )}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)} // a click anywhere outside closes it
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: isGold ? "#121417" : "#16181c",
              backgroundImage: "none",
              color: "#e7e9ea",
              border: isGold
                ? "1px solid rgba(255, 215, 0, 0.35)"
                : "1px solid #2f3336",
              borderRadius: "16px",
              p: 2.5,
              mt: 1,
              width: 250,
              textAlign: "center",
              boxShadow: isGold
                ? "0 12px 36px rgba(0,0,0,0.85), 0 0 24px rgba(255, 215, 0, 0.12)"
                : "0 8px 30px rgba(0,0,0,0.6)",
            },
          },
        }}
      >
        {isGold ? (
          <>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.6,
                color: "#f5a623",
              }}
            >
              <AutoAwesome sx={{ fontSize: 14, color: "#ffd700" }} />
              <Typography
                fontSize={11}
                fontWeight={800}
                sx={{ letterSpacing: "1px", textTransform: "uppercase" }}
              >
                Gold Membership
              </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  mx: "auto",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255, 215, 0, 0.16) 0%, rgba(255, 215, 0, 0.02) 70%)",
                  border: "2px solid #ffd700",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(255, 215, 0, 0.25)",
                }}
              >
                <AllInclusive
                  sx={{
                    fontSize: 34,
                    color: "#ffd700",
                    filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))",
                  }}
                />
                <Typography
                  fontSize={10}
                  fontWeight={800}
                  sx={{
                    color: "#f5a623",
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    mt: 0.5,
                  }}
                >
                  Unlimited
                </Typography>
              </Box>
            </Box>

            <Typography fontWeight={800} fontSize={16} sx={{ color: "#ffffff" }}>
              Unlimited Tweets Active
            </Typography>
            <Typography fontSize={13} sx={{ color: "#8b98a5", mt: 0.5 }}>
              {used} tweet{used === 1 ? "" : "s"} posted this period
            </Typography>
            {sub?.expiresAt && (
              <Typography fontSize={12} sx={{ color: "#71767b", mt: 0.5 }}>
                Valid until {formatDate(sub.expiresAt)}
              </Typography>
            )}

            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setAnchorEl(null);
                navigate("/plans");
              }}
              sx={{
                mt: 2,
                borderRadius: 99,
                textTransform: "none",
                fontWeight: 700,
                color: "#ffd700",
                borderColor: "rgba(255, 215, 0, 0.4)",
                "&:hover": {
                  borderColor: "#ffd700",
                  bgcolor: "rgba(255, 215, 0, 0.1)",
                },
              }}
            >
              Manage subscription
            </Button>
          </>
        ) : (
          <>
            <Typography
              fontSize={13}
              fontWeight={700}
              sx={{ color: "#71767b", textTransform: "uppercase" }}
            >
              Tweet usage
            </Typography>

            <Box sx={{ my: 2 }}>
              <Ring size={110} thickness={4} percent={percent} color={color}>
                <Typography fontSize={26} fontWeight={800} lineHeight={1}>
                  {`${used}/${sub?.tweetLimit ?? "-"}`}
                </Typography>
                <Typography fontSize={11} sx={{ color: "#71767b", mt: 0.5 }}>
                  tweets used
                </Typography>
              </Ring>
            </Box>

            <Typography fontWeight={800} fontSize={16}>
              {sub?.planName ? `${sub.planName} plan` : "Loading..."}
            </Typography>
            <Typography
              fontSize={13}
              sx={{ color: remaining === 0 ? "#f4212e" : "#e7e9ea", mt: 0.5 }}
            >
              {statusText}
            </Typography>
            {sub?.expiresAt && (
              <Typography fontSize={12} sx={{ color: "#71767b", mt: 0.5 }}>
                Valid until {formatDate(sub.expiresAt)}
              </Typography>
            )}

            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setAnchorEl(null);
                navigate("/plans");
              }}
              sx={{
                mt: 2,
                borderRadius: 99,
                textTransform: "none",
                fontWeight: 700,
                color: "#1d9bf0",
                borderColor: "#536471",
                "&:hover": {
                  borderColor: "#1d9bf0",
                  bgcolor: "rgba(29,155,240,0.1)",
                },
              }}
            >
              View plans
            </Button>
          </>
        )}
      </Popover>
    </>
  );
}
