import { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Stack,
  Tab,
  Switch,
  Tabs,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  CalendarMonth,
  Link,
  LocationOn,
  Notifications,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../helper/helper";
import { endpoints } from "../Apis/EndPoints/endpoints";
import { Avatar, Button } from "../Components/UI";
import TweetCard from "../Components/TweetCard";
import EditProfileDialog from "../Components/EditProfileDialog";
import LoginHistoryTable from "../Components/LoginHistory/LoginHistoryTable";
import { useAuth } from "../Context/AuthContext";
import useTweetTranslations from "../helper/useTweetTranslations";
import useNotificationToggle from "../helper/useNotificationToggle";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { translations, markVisible } = useTweetTranslations();
  const [tweets, setTweets] = useState([]);
  const [tab, setTab] = useState(0);
  const [edit, setEdit] = useState(false);

  const {
    enabled: notificationsOn,
    isLoaded: notificationsLoaded,
    busy: notificationsBusy,
    toggle: toggleNotifications,
  } = useNotificationToggle();

  useEffect(() => {
    axiosInstance
      .get(endpoints.posts)
      .then((r) => setTweets(r.data || []))
      .catch(console.error);
  }, []);

  const mine = tweets.filter((t) => t.author?._id === user?._id);
  if (!user) return null;

  const tabs = [
    { key: "posts", label: t("profile.tabs.posts") },
    { key: "replies", label: t("profile.tabs.replies") },
    { key: "highlights", label: t("profile.tabs.highlights") },
    { key: "articles", label: t("profile.tabs.articles") },
    { key: "media", label: t("profile.tabs.media") },
    { key: "loginHistory", label: t("loginHistory.title") },
  ];

  const joinedFormatted = user.joinedDate
    ? new Date(user.joinedDate).toLocaleDateString(i18n.language || "en", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          bgcolor: "rgba(0,0,0,.9)",
          borderBottom: "1px solid #2f3336",
          p: 1.5,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={() => navigate(-1)} sx={{ color: "#fff" }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography fontWeight={700}>{user.displayName}</Typography>
            <Typography fontSize={13} color="text.secondary">
              {t("profile.postsCount", { count: mine.length })}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Box
        sx={{
          height: 200,
          background: "linear-gradient(90deg,#1d9bf0,#7856ff)",
          position: "relative",
        }}
      />
      <Box sx={{ px: 2, position: "relative" }}>
        <Avatar
          src={user.avatar}
          sx={{
            position: "absolute",
            top: -68,
            width: 136,
            height: 136,
            border: "4px solid #000",
          }}
        >
          {user.displayName?.[0]}
        </Avatar>
        <Box textAlign="right" pt={1.5}>
          <Button
            variant="outlined"
            onClick={() => setEdit(true)}
            sx={{
              borderColor: "#536471",
              color: "#e7e9ea",
              fontWeight: 700,
              fontSize: 15,
              textTransform: "none",
              borderRadius: 99,
              px: 2.25,
              py: 0.6,
              "&:hover": {
                borderColor: "#71767b",
                bgcolor: "rgba(231, 233, 234, 0.1)",
              },
            }}
          >
            {t("profile.editProfile")}
          </Button>
        </Box>
        <Box mt={4}>
          <Box>
            <Typography fontSize={20} fontWeight={800} lineHeight={1.25} color="#e7e9ea">
              {user.displayName}
            </Typography>
            <Typography fontSize={15} color="#9ba1a6">
              @{user.username}
            </Typography>
          </Box>

          {user.bio && (
            <Typography fontSize={15} lineHeight={1.4} color="#e7e9ea" sx={{ mt: 1.5 }}>
              {user.bio}
            </Typography>
          )}

          <Stack
            direction="row"
            flexWrap="wrap"
            columnGap={2}
            rowGap={0.75}
            color="#9ba1a6"
            mt={1.5}
            alignItems="center"
          >
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: "-2px" }}>
              <LocationOn sx={{ fontSize: 18 }} />
              <Typography fontSize={14}>
                {user.location || t("account.notSet")}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Link sx={{ fontSize: 18 }} />
              <Typography fontSize={14} color="#1d9bf0">
                {user.website || "example.com"}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <CalendarMonth sx={{ fontSize: 18 }} />
              <Typography fontSize={14}>
                {t("profile.joined", { date: joinedFormatted })}
              </Typography>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              mt: 2,
              pt: 1.5,
              pb: 0.5,
              borderTop: "1px solid #2f3336",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: "-2px" }}>
              <Notifications
                sx={{
                  color: notificationsOn ? "#1d9bf0" : "#9ba1a6",
                  fontSize: 20,
                  transition: "color 0.2s",
                }}
              />
              <Box>
                <Typography fontWeight={700} fontSize={14} color="#e7e9ea" lineHeight={1.3}>
                  {t("settings.notifications")}
                </Typography>
                <Typography fontSize={12.5} color="#9ba1a6" lineHeight={1.35}>
                  {t("settings.notificationsDesc")}
                </Typography>
              </Box>
            </Stack>
            <Switch
              size="small"
              checked={notificationsOn}
              disabled={!notificationsLoaded || notificationsBusy}
              onChange={toggleNotifications}
              inputProps={{ "aria-label": t("settings.notifications") }}
            />
          </Stack>
        </Box>
      </Box>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mt: 1,
          borderBottom: "1px solid #2f3336",
          "& .MuiTab-root": {
            textTransform: "none",
            color: "#9ba1a6",
            fontWeight: 700,
            minWidth: "auto",
            flex: { sm: "1 0 auto" },
            whiteSpace: "nowrap",
            px: 1,
          },
          "& .Mui-selected": { color: "#fff" },
        }}
      >
        {tabs.map((x) => (
          <Tab key={x.key} label={x.label} />
        ))}
      </Tabs>
      {tab === 0 ? (
        mine.map((t) => (
          <TweetCard
            key={t._id}
            tweet={t}
            translation={translations[t._id]}
            onVisible={markVisible}
            onDelete={(id) =>
              setTweets((prev) => prev.filter((tw) => tw._id !== id))
            }
          />
        ))
      ) : tabs[tab]?.key === "loginHistory" ? (
        <LoginHistoryTable />
      ) : (
        <Box textAlign="center" py={8} color="text.secondary">
          <Typography variant="h6" fontWeight={700}>
            {t("profile.nothingHere")}
          </Typography>
        </Box>
      )}
      <EditProfileDialog open={edit} onClose={() => setEdit(false)} />
    </>
  );
}
