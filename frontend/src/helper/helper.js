import axios from "axios";
import { auth } from "../Context/firebase";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the Firebase ID token. getIdToken() is cached and auto-refreshed by Firebase.
axiosInstance.interceptors.request.use(async (config) => {
  // don't override a header a call sets itself (verifyPhoneApi forces a fresh token)
  if (auth?.currentUser && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }
  return config;
});

export default axiosInstance; 
