import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useNotifications } from "../Context/NotificationContext";
import LoadingSpinner from "../Components/LoadingSpinner";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { notifications, unreadCount, enabled, isLoaded, markAllRead, refresh } =
    useNotifications();
  const [marking, setMarking] = useState(false);

  // Always show fresh data when the page opens (popup: false would also be fine,
  // but the context already ignores popups it has shown before).
  useEffect(() => {
    refresh().catch((error) => console.error("Failed to refresh notifications", error));
  }, [refresh]);

  const handleMarkAll = async () => {
    setMarking(true);
    try {
      await markAllRead();
      toast.success(t("notifications.marked"));
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
      toast.error(t("notifications.markFailed"));
    } finally {
      setMarking(false);
    }
  };

  const formatTime = (value) =>
    new Date(value).toLocaleString(i18n.language || "en", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: { xs: 53, sm: 0 },
          zIndex: 2,
          bgcolor: "rgba(0,0,0,.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #2f3336",
          p: 1.5,
          px: 2,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Typography variant="h6" fontWeight={800}>
            {t("notifications.title")}
          </Typography>
          <Button
            onClick={handleMarkAll}
            disabled={marking || unreadCount === 0}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 99 }}
          >
            {t("notifications.markAllRead")}
          </Button>
        </Stack>
      </Box>

      {!enabled && isLoaded && (
        <Box sx={{ p: 2, borderBottom: "1px solid #2f3336", bgcolor: "#16181c" }}>
          <Typography fontSize={14} color="text.secondary">
            {t("notifications.offBanner")}
          </Typography>
          <Button
            onClick={() => navigate("/settings")}
            sx={{ textTransform: "none", fontWeight: 700, mt: 1, px: 0 }}
          >
            {t("notifications.openSettings")}
          </Button>
        </Box>
      )}

      {!isLoaded ? (
        <Box display="grid" py={6} sx={{ placeItems: "center" }}>
          <LoadingSpinner size={32} />
        </Box>
      ) : notifications.length === 0 ? (
        <Box textAlign="center" py={8} px={3} color="text.secondary">
          <Typography variant="h6" fontWeight={700}>
            {t("notifications.empty")}
          </Typography>
          <Typography fontSize={14} mt={1}>
            {t("notifications.emptyDesc")}
          </Typography>
        </Box>
      ) : (
        notifications.map((n) => (
          <Box
            key={n._id}
            sx={{
              p: 2,
              borderBottom: "1px solid #2f3336",
              bgcolor: n.read ? "transparent" : "rgba(29, 155, 240, 0.08)",
              borderLeft: n.read ? "3px solid transparent" : "3px solid #1d9bf0",
            }}
          >
            <Typography fontWeight={700}>
              {t("notifications.postedAbout", {
                name: n.authorName,
                keyword: n.keyword,
              })}
            </Typography>
            <Typography sx={{ mt: 0.5, wordBreak: "break-word" }}>{n.content}</Typography>
            <Typography fontSize={13} color="text.secondary" mt={0.5}>
              {formatTime(n.createdAt)}
            </Typography>
          </Box>
        ))
      )}
    </>
  );
}
