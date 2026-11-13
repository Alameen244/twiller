
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  Bookmark,
  Home,
  Mail,
  Notifications,
  Person,
  Search,
  Settings
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import TwitterLogo from "../TwitterLogo";
import { Avatar } from "../UI";

const links = [
  ["Home", Home, "/"],
  ["Explore", Search, "/explore"],
  ["Notifications", Notifications, "/notifications"],
  ["Messages", Mail, "/messages"],
  ["Bookmarks", Bookmark, "/bookmarks"],
  ["Profile", Person, "/profile"],
  ["Settings", Settings, "/settings"],
];

function RightSidebar() {
  return (
    <Stack spacing={2}>
      <Box
        sx={{ bgcolor: "#202327", borderRadius: 99, p: 1.25, px: 2, color: "#71767b" }}
      >
        Search
      </Box>
      <Box sx={{ bgcolor: "#16181c", borderRadius: 2, p: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          Subscribe to Premium
        </Typography>
        <Typography variant="body2" sx={{ my: 1 }}>
          Subscribe to unlock new features and earn a share of revenue.
        </Typography>
        <Button variant="contained" sx={{ borderRadius: 99, textTransform: "none", fontWeight: 700 }}>
          Subscribe
        </Button>
      </Box>
    </Stack>
  );
}

export default function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  return (
    <Box
      data-component="app-layout-container"
      sx={{ minHeight: "100vh", bgcolor: "#000", display: "flex", justifyContent: "center" }}
    >
      <Box
        data-component="sidebar-left"
        component="aside"
        sx={{
          width: { xs: 72, md: 260 },
          borderRight: "1px solid #2f3336",
          height: "100vh",
          position: "sticky",
          top: 0,
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 1, mb: 2 }} data-component="logo-container">
          <TwitterLogo size={32} />
        </Box>

        {links.map(([label, Icon, path]) => {
             const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          return (
            <Button
              data-component="nav-link"
              data-nav-label={label}
              data-active={isActive}
              key={label}
              onClick={() => navigate(path)}
              sx={{
                justifyContent: "flex-start",
                color: isActive ? "#1d9bf0" : "#fff",
                py: 1.25,
                mb: 0.5,
                px: 2,
                borderRadius: 99,
                bgcolor: isActive ? "rgba(29, 155, 240, 0.15)" : "transparent",
                fontWeight: isActive ? 700 : 400,
                transition: "all 0.2s ease-in-out",
                transform: "scale(1)",
                "&:hover": {
                  bgcolor: isActive ? "rgba(29, 155, 240, 0.25)" : "rgba(255, 255, 255, 0.1)",
                  transform: "scale(1.02)",
                  "& .MuiSvgIcon-root": {
                    transform: "scale(1.1)",
                  },
                },
                "& .MuiSvgIcon-root": {
                  transition: "transform 0.2s ease-in-out",
                },
              }}
            >
              <Icon />
              <Typography sx={{ ml: 2, fontSize: 20, display: { xs: "none", md: "block" } }}>
                {label}
              </Typography>
            </Button>
          );
        })}



        <Box sx={{ mt: "auto" }} data-component="sidebar-profile-section">
          <Button
            data-component="profile-button"
            onClick={() => navigate("/profile")}
            sx={{
              p: 1.5,
              color: "#fff",
              justifyContent: "flex-start",
              width: "100%",
              borderRadius: 99,
              transition: "all 0.2s ease-in-out",
              transform: "scale(1)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
                transform: "scale(1.02)",
                "& .MuiAvatar-root": {
                  transform: "scale(1.1)",
                  boxShadow: "0 0 0 3px rgba(29, 155, 240, 0.3)",
                },
              },
              "& .MuiAvatar-root": {
                transition: "all 0.2s ease-in-out",
              },
            }}
          >
            <Avatar
              data-component="avatar"
              data-location="sidebar-bottom"
              data-avatar-url={user?.avatar}
              src={user?.avatar}
              size={40}
            >
              {user?.displayName?.[0]}
            </Avatar>
            <Box
              data-component="profile-info"
              sx={{ display: { xs: "none", md: "block" }, textAlign: "left", ml: 1 }}
            >
              <Typography fontWeight={700} data-component="profile-name">{user?.displayName}</Typography>
              <Typography fontSize={13} color="text.secondary" data-component="profile-username">@{user?.username}</Typography>
            </Box>
          </Button>
        </Box>
      </Box>

      <Box
        data-component="main-content"
        component="main"
        sx={{ width: "100%", maxWidth: 600, borderRight: "1px solid #2f3336" }}
      >
        <Outlet />
      </Box>
      <Box
        data-component="sidebar-right"
        component="aside"
        sx={{ display: { xs: "none", lg: "block" }, width: 350, p: 2 }}
      >
        <RightSidebar />
      </Box>
    </Box >
  );
}
