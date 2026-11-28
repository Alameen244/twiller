import axios from "axios";
import { auth } from "../Context/firebase";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Attach headers and Firebase ID token.
axiosInstance.interceptors.request.use(async (config) => {
  // If the payload is FormData, remove Content-Type so browser sets multipart/form-data with boundary
  if (config.data instanceof FormData) {
    if (config.headers?.delete) {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
    }
  } else if (config.headers && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  // Ensure Firebase finishes restoring auth.currentUser from local persistence
  // before deciding whether to attach a token (prevents 401s during SWR startup).
  if (auth && !auth.currentUser && typeof auth.authStateReady === "function") {
    await auth.authStateReady();
  }

  // Attach the Firebase ID token. getIdToken() is cached and auto-refreshed by Firebase.
  if (auth?.currentUser && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }
  return config;
});

export default axiosInstance;
