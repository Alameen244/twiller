import { createElement } from "react";
import { toast } from "react-toastify";
import i18n from "../i18n";
import NotificationToast from "../Components/NotificationToast";

export const isBrowserNotificationSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

// "granted" | "denied" | "default" | "unsupported"
export const getNotificationPermission = () =>
  isBrowserNotificationSupported() ? window.Notification.permission : "unsupported";

let swRegistrationPromise = null;

// Registers our lightweight service worker so mobile browsers (Android Chrome)
// can show real OS notifications via registration.showNotification().
const getServiceWorkerRegistration = () => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }
  if (!swRegistrationPromise) {
    swRegistrationPromise = navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .catch(() => null);
  }
  return swRegistrationPromise;
};

// Must be called from a user action (for example the toggle click), or browsers ignore it.
// Never throws. Returns the resulting permission.
export const requestNotificationPermission = async () => {
  if (!isBrowserNotificationSupported()) return "unsupported";
  getServiceWorkerRegistration(); // warm up service worker for mobile browsers
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
// Uses a real browser notification when permission is granted (via Service Worker on
// mobile browsers that forbid `new Notification()`), otherwise an in-app toast. Never throws.
export const showNotificationPopup = async (notification) => {
  const title = i18n.t("notifications.postedAbout", {
    name: notification.authorName,
    keyword: notification.keyword,
  });
  const body = notification.content || ""; // the full tweet text, as the task requires
  const tag = `twiller-${notification.tweet}`; // same tweet = same popup, even across tabs

  if (getNotificationPermission() === "granted") {
    try {
      const popup = new window.Notification(title, { body, tag });
      popup.onclick = () => {
        popup.close();
        openNotificationsPage();
      };
      return;
    } catch {
      // Mobile browsers (e.g., Android Chrome) disallow `new Notification()` and require a Service Worker.
      try {
        const reg = await getServiceWorkerRegistration();
        if (reg && "showNotification" in reg) {
          await reg.showNotification(title, { body, tag, icon: "/favicon.svg" });
          return;
        }
      } catch (swError) {
        console.error("Service worker notification failed, using toast instead", swError);
      }
    }
  }

  try {
    toast(createElement(NotificationToast, { title, body }), {
      icon: false,
      className: "twiller-notification-toast",
      onClick: openNotificationsPage,
      autoClose: 6000,
    });
  } catch (error) {
    console.error("Notification toast failed", error);
  }
};
