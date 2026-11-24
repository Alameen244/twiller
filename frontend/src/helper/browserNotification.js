import { toast } from "react-toastify";
import i18n from "../i18n";

export const isBrowserNotificationSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

// "granted" | "denied" | "default" | "unsupported"
export const getNotificationPermission = () =>
  isBrowserNotificationSupported() ? window.Notification.permission : "unsupported";

// Must be called from a user action (for example the toggle click), or browsers ignore it.
// Never throws. Returns the resulting permission.
export const requestNotificationPermission = async () => {
  if (!isBrowserNotificationSupported()) return "unsupported";
  if (window.Notification.permission !== "default") return window.Notification.permission;
  try {
    // Old Safari uses a callback and returns undefined, so fall back to the current value.
    const result = await window.Notification.requestPermission();
    return result || window.Notification.permission;
  } catch {
    return window.Notification.permission;
  }
};

const openNotificationsPage = () => {
  window.focus();
  if (window.location.pathname !== "/notifications") {
    window.location.assign("/notifications");
  }
};

// Shows one popup for a notification object { tweet, keyword, content, authorName }.
// Uses a real browser notification when permission is granted, otherwise an in-app toast,
// so the user still sees it. Never throws.
export const showNotificationPopup = (notification) => {
  const title = i18n.t("notifications.postedAbout", {
    name: notification.authorName,
    keyword: notification.keyword,
  });
  const body = notification.content || ""; // the full tweet text, as the task requires

  if (getNotificationPermission() === "granted") {
    try {
      const popup = new window.Notification(title, {
        body,
        tag: `twiller-${notification.tweet}`, // same tweet = same popup, even across tabs
      });
      popup.onclick = () => {
        popup.close();
        openNotificationsPage();
      };
      return;
    } catch (error) {
      // Some mobile browsers only allow notifications through a service worker.
      console.error("Browser notification failed, using toast instead", error);
    }
  }

  try {
    toast.info(`${title}: ${body}`, { onClick: openNotificationsPage });
  } catch (error) {
    console.error("Notification toast failed", error);
  }
};
