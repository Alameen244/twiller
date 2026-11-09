import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import { useAuth } from "./Context/AuthContext";
import AppLayout from "./Components/Layout/AppLayout";
import LandingPage from "./Pages/LandingPage";
import FeedPage from "./Pages/FeedPage";
import ProfilePage from "./Pages/ProfilePage";
import PlaceholderPage from "./Pages/PlaceholderPage";
import LoadingSpinner from "./Components/LoadingSpinner";
function Shell() {
  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <Box minHeight="100vh" display="grid" sx={{ placeItems: "center" }}>
        <LoadingSpinner size={42} />
      </Box>
    );
  if (!user) return <LandingPage />;
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/explore" element={<PlaceholderPage title="Explore" />} />
        <Route
          path="/notifications"
          element={<PlaceholderPage title="Notifications" />}
        />
        <Route
          path="/messages"
          element={<PlaceholderPage title="Messages" />}
        />
        <Route
          path="/bookmarks"
          element={<PlaceholderPage title="Bookmarks" />}
        />
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
