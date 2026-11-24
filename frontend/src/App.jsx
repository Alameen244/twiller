import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import { useAuth } from "./Context/AuthContext";
import AppLayout from "./Components/Layout/AppLayout";
import LandingPage from "./Pages/LandingPage";
import FeedPage from "./Pages/FeedPage";
import ProfilePage from "./Pages/ProfilePage";
import PlaceholderPage from "./Pages/PlaceholderPage";
import LoadingSpinner from "./Components/LoadingSpinner";
import SettingsPage from "./Pages/SettingsPage";
import SettingsAccountPage from "./Pages/SettingsAccountPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import LoginOtpVerify from "./Components/LoginOtp/LoginOtpVerify";
import SettingsLoginHistoryPage from "./Pages/SettingsLoginHistoryPage";
import PlansPage from "./Pages/PlansPage";
import NotificationsPage from "./Pages/NotificationsPage";

function Shell() {
  const { user, isAuthReady, pendingLogin } = useAuth();
  if (!isAuthReady)
    return (
      <Box minHeight="100vh" display="grid" sx={{ placeItems: "center" }}>
        <LoadingSpinner size={42} />
      </Box>
    );
    if (pendingLogin) return <LoginOtpVerify />;
    if (!user)
    return (
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/explore" element={<PlaceholderPage title="Explore" />} />
        <Route path="/notifications"
          element={<NotificationsPage />} />
        <Route
          path="/messages"
          element={<PlaceholderPage title="Messages" />}
        />
        <Route
          path="/bookmarks"
          element={<PlaceholderPage title="Bookmarks" />}
        />
          <Route path="/plans" element={<PlansPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/login-history" element={<SettingsLoginHistoryPage />} />
        <Route path="/settings/account" element={<SettingsAccountPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
