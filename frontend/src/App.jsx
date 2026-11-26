import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { useAuth } from "./Context/AuthContext";
import AppLayout from "./Components/Layout/AppLayout";
import LoadingSpinner from "./Components/LoadingSpinner";

const LandingPage = lazy(() => import("./Pages/LandingPage"));
const FeedPage = lazy(() => import("./Pages/FeedPage"));
const ProfilePage = lazy(() => import("./Pages/ProfilePage"));
const PlaceholderPage = lazy(() => import("./Pages/PlaceholderPage"));
const SettingsPage = lazy(() => import("./Pages/SettingsPage"));
const SettingsAccountPage = lazy(() => import("./Pages/SettingsAccountPage"));
const SettingsAccountInfoPage = lazy(() => import("./Pages/SettingsAccountInfoPage"));
const SettingsResetPasswordPage = lazy(() => import("./Pages/SettingsResetPasswordPage"));
const ForgotPasswordPage = lazy(() => import("./Pages/ForgotPasswordPage"));
const LoginOtpVerify = lazy(() => import("./Components/LoginOtp/LoginOtpVerify"));
const SettingsLoginHistoryPage = lazy(() => import("./Pages/SettingsLoginHistoryPage"));
const PlansPage = lazy(() => import("./Pages/PlansPage"));
const NotificationsPage = lazy(() => import("./Pages/NotificationsPage"));
const NotFoundPage = lazy(() => import("./Pages/NotFoundPage"));

function PageFallback() {
  return (
    <Box minHeight="100vh" display="grid" sx={{ placeItems: "center" }}>
      <LoadingSpinner size={42} />
    </Box>
  );
}

function LazyOutlet() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Outlet />
    </Suspense>
  );
}

function UnknownRouteRedirect() {
  const location = useLocation();
  return (
    <Navigate
      to="/404"
      replace
      state={{ from: `${location.pathname}${location.search}` }}
    />
  );
}

function Shell() {
  const { user, isAuthReady, pendingLogin } = useAuth();
  if (!isAuthReady) return <PageFallback />;
  if (pendingLogin) {
    return (
      <Suspense fallback={<PageFallback />}>
        <LoginOtpVerify />
      </Suspense>
    );
  }
  if (!user) {
    return (
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<UnknownRouteRedirect />} />
        </Routes>
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route element={<LazyOutlet />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/explore" element={<PlaceholderPage title="Explore" />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/messages" element={<PlaceholderPage title="Messages" />} />
            <Route path="/bookmarks" element={<PlaceholderPage title="Bookmarks" />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/login-history" element={<SettingsLoginHistoryPage />} />
            <Route path="/settings/account" element={<SettingsAccountPage />} />
            <Route path="/settings/account/information" element={<SettingsAccountInfoPage />} />
            <Route path="/settings/account/reset-password" element={<SettingsResetPasswordPage />} />
          </Route>
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<UnknownRouteRedirect />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
