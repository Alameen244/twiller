import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { auth } from "./firebase";
import { useAuth } from "./AuthContext";
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
  updateNotificationPreferenceApi,
} from "../Apis/notificationApi";
import { showNotificationPopup } from "../helper/browserNotification";

const NotificationContext = createContext(null);

const POLL_INTERVAL_MS = 20000;
const FETCH_LIMIT = 50;
const MAX_POPUPS_PER_POLL = 5; // the rest are still in the history list

// Dedupe: the time of the newest notification already shown as a popup, per user.
// localStorage is shared by all tabs, so a refresh or a second tab does not repeat a popup.
const storageKey = (email) => `twitter-last-notified:${email}`;

const readLastNotified = (email) => {
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
};

const writeLastNotified = (email, ms) => {
  try {
    localStorage.setItem(storageKey(email), String(ms));
  } catch {
    /* storage blocked: popups may repeat after a refresh, nothing else breaks */
  }
};

const toMs = (notification) => new Date(notification.createdAt).getTime();
const newestMs = (list) => list.reduce((max, n) => Math.max(max, toMs(n)), 0);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const email = user?.email ?? null;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [enabled, setEnabled] = useState(false); // saved preference, from the backend
  const [isLoaded, setIsLoaded] = useState(false);

  const activeEmailRef = useRef(null); // ignores a response that arrives after logout / account switch

  // Loads the list and the saved preference.
  // popup: show popups for new unread notifications (only when the preference is on).
  // resetBaseline: mark everything currently stored as already seen (used when turning ON).
  const fetchNotifications = useCallback(
    async ({ popup = true, resetBaseline = false } = {}) => {
      if (!email) return null;
      const data = await getNotificationsApi(FETCH_LIMIT);
      if (activeEmailRef.current !== email) return null;

      const list = data.notifications || [];
      setNotifications(list);
      setUnreadCount(data.unreadCount || 0);
      setEnabled(data.notificationsEnabled === true);
      setIsLoaded(true);

      if (resetBaseline) {
        writeLastNotified(email, newestMs(list));
      } else if (popup && data.notificationsEnabled === true) {
        const last = readLastNotified(email);
        if (last === null) {
          // First time on this browser: do not pop the old history, only what comes next.
          writeLastNotified(email, newestMs(list));
        } else {
          const fresh = list
            .filter((n) => !n.read && toMs(n) > last)
            .sort((a, b) => toMs(a) - toMs(b)); // oldest first
          if (fresh.length > 0) {
            // Save BEFORE showing, so another tab does not show the same ones.
            writeLastNotified(email, newestMs(fresh));
            fresh.slice(-MAX_POPUPS_PER_POLL).forEach(showNotificationPopup);
          }
        }
      }
      return data;
    },
    [email]
  );

  // Login / logout: load once (this also tells us the saved preference), or reset everything.
  useEffect(() => {
    activeEmailRef.current = email;
    if (!email) {
      setNotifications([]);
      setUnreadCount(0);
      setEnabled(false);
      setIsLoaded(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      if (auth && !auth.currentUser && typeof auth.authStateReady === "function") {
        await auth.authStateReady();
      }
      if (cancelled || (auth && !auth.currentUser)) return;
      await fetchNotifications();
    })().catch((err) => console.error("Failed to load notifications", err));
    return () => {
      cancelled = true;
    };
  }, [email, fetchNotifications]);

  // Polling runs only while logged in AND the preference is on.
  useEffect(() => {
    if (!email || !enabled) return undefined;
    const id = setInterval(() => {
      fetchNotifications().catch((err) => console.error("Notification polling failed", err));
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [email, enabled, fetchNotifications]);

  // Used by the toggle. Throws on failure so the caller can show a toast.
  const setNotificationsEnabled = useCallback(
    async (value) => {
      if (!email) return;
      await updateNotificationPreferenceApi(value);
      if (value) {
        // Only notifications created from now on will pop up.
        await fetchNotifications({ popup: false, resetBaseline: true });
      }
      setEnabled(value);
    },
    [email, fetchNotifications]
  );

  // Used by the Notifications page. Throws on failure.
  const markAllRead = useCallback(async () => {
    await markAllNotificationsReadApi();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const refresh = useCallback(() => fetchNotifications(), [fetchNotifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      enabled,
      isLoaded,
      setNotificationsEnabled,
      markAllRead,
      refresh,
    }),
    [notifications, unreadCount, enabled, isLoaded, setNotificationsEnabled, markAllRead, refresh]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => {
  const value = useContext(NotificationContext);
  if (!value) throw new Error("useNotifications must be used within NotificationProvider");
  return value;
};
