import { axiosInstance } from "../helper/helper";
import { endpoints } from "./EndPoints/endpoints";

// -> { notifications, unreadCount, notificationsEnabled }
export const getNotificationsApi = (limit) =>
  axiosInstance.get(endpoints.notifications, { params: { limit } }).then((r) => r.data);

// -> { unreadCount, notificationsEnabled }
export const getUnreadCountApi = () =>
  axiosInstance.get(endpoints.notificationsUnreadCount).then((r) => r.data);

export const markAllNotificationsReadApi = () =>
  axiosInstance.patch(endpoints.notificationsReadAll).then((r) => r.data);

// -> { message, notificationsEnabled }
export const updateNotificationPreferenceApi = (enabled) =>
  axiosInstance.patch(endpoints.notificationsPreference, { enabled }).then((r) => r.data);
