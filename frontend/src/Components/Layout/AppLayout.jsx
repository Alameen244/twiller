import { Badge, Box, Button, Stack, Typography } from "@mui/material";
import {
  Bookmark,
  Home,
  Mail,
  Notifications,
  Person,
  Search,
  Settings,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../Context/AuthContext";
import { useNotifications } from "../../Context/NotificationContext";
import TwitterLogo from "../TwitterLogo";
import { Avatar } from "../UI";
import WhoToFollow from "../WhoToFollow";
import { MobileBottomNav, MobileTopBar } from "./MobileNav";

const links = [
  ["Home", "home", Home, "/"],
  ["Explore", "explore", Search, "/explore"],
  ["Notifications", "notifications", Notifications, "/notifications"],
  ["Messages", "messages", Mail, "/messages"],
  ["Bookmarks", "bookmarks", Bookmark, "/bookmarks"],
  ["Profile", "profile", Person, "/profile"],
  ["Settings", "settings", Settings, "/settings"],
];

function RightSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Stack spacing={2}>
      <Box
        sx={{
          bgcolor: "#202327",
          borderRadius: 99,
          p: 1.25,
          px: 2,
          color: "#71767b",
        }}
      >
        {t("nav.search")}
      </Box>
      <Box sx={{ bgcolor: "#16181c", borderRadius: 2, p: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          {t("nav.subscribePremium")}
        </Typography>
        <Typography variant="body2" sx={{ my: 1 }}>
          {t("nav.subscribeDescription")}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/plans")}
          sx={{ borderRadius: 99, textTransform: "none", fontWeight: 700 }}
        >
          {t("nav.subscribe")}
        </Button>
      </Box>
      <WhoToFollow />
    </Stack>
  );
}

export default function AppLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      data-component="app-layout-container"
      sx={{
        minHeight: "100dvh",
        bgcolor: "#000",
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1320, // Derived wider desktop layout: 275 (left) + 665 (main) + 380 (right)
          marginInline: "auto",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "center",
        }}
      >
        <MobileTopBar user={user} />

        <Box
          data-component="sidebar-left"
          component="aside"
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            flexShrink: 0,
            width: { sm: 72, md: 260, lg: 275 },
            borderRight: "1px solid #2f3336",
            height: "100dvh",
            position: "sticky",
            top: 0,
            p: { sm: 1, md: 2 },
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              p: 1,
              mb: 2,
              alignSelf: { sm: "center", md: "flex-start" },
            }}
            data-component="logo-container"
          >
            <TwitterLogo size={32} />
          </Box>

          {links.map(([label, key, Icon, path]) => {
            const isActive =
              path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(path);
            return (
              <Button
                data-component="nav-link"
                data-nav-label={label}
                data-active={isActive}
                key={label}
                aria-label={t(`nav.${key}`)}
                onClick={() => navigate(path)}
                sx={{
                  justifyContent: { sm: "center", md: "flex-start" },
                  alignSelf: { sm: "center", md: "stretch" },
                  minWidth: { sm: 48, md: 0 },
                  width: { sm: 48, md: "auto" },
                  height: { sm: 48, md: "auto" },
                  color: isActive ? "#1d9bf0" : "#fff",
                  py: { sm: 0, md: 1.25 },
                  mb: 0.5,
                  px: { sm: 0, md: 2 },
                  borderRadius: 99,
                  bgcolor: isActive ? "rgba(29, 155, 240, 0.15)" : "transparent",
                  fontWeight: isActive ? 700 : 400,
                  transition: "all 0.2s ease-in-out",
                  transform: "scale(1)",
                  "&:hover": {
                    bgcolor: isActive
                      ? "rgba(29, 155, 240, 0.25)"
                      : "rgba(255, 255, 255, 0.1)",
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
                {key === "notifications" ? (
                  <Badge
                    badgeContent={unreadCount}
                    color="primary"
                    max={99}
                    invisible={unreadCount === 0}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 11,
                        height: 18,
                        minWidth: 18,
                        fontWeight: 700,
                      },
                    }}
                  >
                    <Icon />
                  </Badge>
                ) : (
                  <Icon />
                )}
                <Typography
                  sx={{
                    ml: 2,
                    fontSize: 20,
                    display: { xs: "none", md: "block" },
                    whiteSpace: "nowrap",
                  }}
                >
                  {t(`nav.${key}`)}
                </Typography>
              </Button>
            );
          })}

          <Box sx={{ mt: "auto" }} data-component="sidebar-profile-section">
            <Button
              data-component="profile-button"
              onClick={() => navigate("/profile")}
              aria-label={t("nav.profile")}
              sx={{
                p: { sm: 0.5, md: 1.5 },
                minWidth: 0,
                color: "#fff",
                justifyContent: { sm: "center", md: "flex-start" },
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
                sx={{
                  display: { xs: "none", md: "block" },
                  textAlign: "left",
                  ml: 1,
                  minWidth: 0,
                }}
              >
                <Typography fontWeight={700} noWrap data-component="profile-name">
                  {user?.displayName}
                </Typography>
                <Typography
                  fontSize={13}
                  color="text.secondary"
                  noWrap
                  data-component="profile-username"
                >
                  @{user?.username}
                </Typography>
              </Box>
            </Button>
          </Box>
        </Box>

        <Box
          data-component="main-content"
          component="main"
          sx={{
            width: "100%",
            maxWidth: 665,
            flex: { xs: "1 0 auto", sm: "1 1 665px" },
            minWidth: 0,
            mx: { xs: "auto", sm: 0 },
            pb: { xs: "72px", sm: 0 },
            borderRight: { xs: "none", sm: "1px solid #2f3336" },
          }}
        >
          <Outlet />
        </Box>

        <Box
          data-component="sidebar-right"
          component="aside"
          sx={{
            display: { xs: "none", lg: "block" },
            flexShrink: 0,
            width: 380,
            p: 2,
            position: "sticky",
            top: 0,
            height: "100dvh",
            overflowY: "auto",
          }}
        >
          <RightSidebar />
        </Box>

        <MobileBottomNav unreadCount={unreadCount} />
      </Box>
    </Box>
  );
}
