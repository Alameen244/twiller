import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useNotifications } from "../Context/NotificationContext";
import { requestNotificationPermission } from "./browserNotification";

// Shared by the Profile page and the Settings page, so both always behave the same.
export default function useNotificationToggle() {
  const { t } = useTranslation();
  const { enabled, isLoaded, setNotificationsEnabled } = useNotifications();
  const [busy, setBusy] = useState(false);

  const toggle = useCallback(async () => {
    if (busy) return;
    const next = !enabled;
    setBusy(true);
    try {
      if (next) {
        // Asked first, straight from the click, because browsers ignore prompts
        // that are not tied to a user action. Never throws.
        const permission = await requestNotificationPermission();
        if (permission !== "granted") toast.info(t("notifications.permissionBlocked"));
      }
      await setNotificationsEnabled(next);
      toast.success(t(next ? "notifications.enabledToast" : "notifications.disabledToast"));
    } catch (error) {
      console.error("Failed to update notification preference", error);
      toast.error(t("notifications.updateFailed"));
    } finally {
      setBusy(false);
    }
  }, [busy, enabled, setNotificationsEnabled, t]);

  return { enabled, isLoaded, busy, toggle };
}
