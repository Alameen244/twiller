import { Badge, Box, IconButton } from "@mui/material";
import {
  Bookmark,
  Home,
  Mail,
  Notifications,
  Search,
  Settings,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TwitterLogo from "../TwitterLogo";
import { Avatar } from "../UI";

const mobileNavItems = [
  ["Home", "home", Home, "/"],
  ["Explore", "explore", Search, "/explore"],
  ["Notifications", "notifications", Notifications, "/notifications"],
  ["Messages", "messages", Mail, "/messages"],
  ["Bookmarks", "bookmarks", Bookmark, "/bookmarks"],
];

export function MobileTopBar({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box
      data-component="mobile-top-bar"
      component="header"
      sx={{
        display: { xs: "flex", sm: "none" },
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1100,
        height: 53,
        px: 1.5,
        bgcolor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #2f3336",
      }}
    >
      <IconButton
        onClick={() => navigate("/profile")}
        aria-label={t("nav.profile")}
        sx={{ p: 0.5, minWidth: 44, minHeight: 44 }}
      >
        <Avatar src={user?.avatar} size={32}>
          {user?.displayName?.[0]}
        </Avatar>
      </IconButton>

      <IconButton
        onClick={() => navigate("/")}
        aria-label={t("nav.home")}
        sx={{ minWidth: 44, minHeight: 44 }}
      >
        <TwitterLogo size={26} />
      </IconButton>

      <IconButton
        onClick={() => navigate("/settings")}
        aria-label={t("nav.settings")}
        sx={{ color: "#e7e9ea", minWidth: 44, minHeight: 44 }}
      >
        <Settings />
      </IconButton>
    </Box>
  );
}

export function MobileBottomNav({ unreadCount }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      data-component="mobile-bottom-nav"
      component="nav"
      sx={{
        display: { xs: "flex", sm: "none" },
        alignItems: "center",
        justifyContent: "space-around",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        height: 56,
        pb: "env(safe-area-inset-bottom)",
        bgcolor: "rgba(0, 0, 0, 0.92)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid #2f3336",
      }}
    >
      {mobileNavItems.map(([label, key, Icon, path]) => {
        const isActive =
          path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(path);
        return (
          <IconButton
            key={label}
            data-component="mobile-nav-link"
            data-nav-label={label}
            aria-label={t(`nav.${key}`)}
            onClick={() => navigate(path)}
            sx={{
              color: isActive ? "#1d9bf0" : "#e7e9ea",
              minWidth: 44,
              minHeight: 44,
              borderRadius: 99,
              bgcolor: isActive ? "rgba(29, 155, 240, 0.12)" : "transparent",
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
                    fontSize: 10,
                    height: 16,
                    minWidth: 16,
                    fontWeight: 700,
                  },
                }}
              >
                <Icon />
              </Badge>
            ) : (
              <Icon />
            )}
          </IconButton>
        );
      })}
    </Box>
  );
}
