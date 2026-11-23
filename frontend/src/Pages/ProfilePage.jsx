import { useEffect, useState } from "react";
import { Box, IconButton, Stack, Tab, Tabs, Typography } from "@mui/material";
import {
  ArrowBack,
  CalendarMonth,
  Link,
  LocationOn,
  MoreHoriz,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../helper/helper";
import { endpoints } from "../Apis/EndPoints/endpoints";
import { Avatar, Button } from "../Components/UI";
import TweetCard from "../Components/TweetCard";
import EditProfileDialog from "../Components/EditProfileDialog";
import { useAuth } from "../Context/AuthContext";
import useTweetTranslations from "../helper/useTweetTranslations";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { translations, markVisible } = useTweetTranslations();
  const [tweets, setTweets] = useState([]);
  const [tab, setTab] = useState(0);
  const [edit, setEdit] = useState(false);

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
        <Box textAlign="right" pt={1}>
          <Button
            variant="outlined"
            onClick={() => setEdit(true)}
            sx={{ borderColor: "#536471", color: "#fff", fontWeight: 700 }}
          >
            {t("profile.editProfile")}
          </Button>
        </Box>
        <Box mt={5}>
          <Stack direction="row" justifyContent="space-between">
            <Box>
              <Typography variant="h5" fontWeight={800}>
                {user.displayName}
              </Typography>
              <Typography color="text.secondary">@{user.username}</Typography>
            </Box>
            <MoreHoriz color="disabled" />
          </Stack>
          {user.bio && <Typography my={1}>{user.bio}</Typography>}
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={2}
            color="text.secondary"
            mt={1}
          >
            <Stack direction="row">
              <LocationOn fontSize="small" />
              <Typography fontSize={14}>{user.location || t("account.notSet")}</Typography>
            </Stack>
            <Stack direction="row">
              <Link fontSize="small" />
              <Typography fontSize={14} color="primary.main">
                {user.website || "example.com"}
              </Typography>
            </Stack>
            <Stack direction="row">
              <CalendarMonth fontSize="small" />
              <Typography fontSize={14}>
                {t("profile.joined", { date: joinedFormatted })}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          mt: 2,
          borderBottom: "1px solid #2f3336",
          "& .MuiTab-root": {
            textTransform: "none",
            color: "#71767b",
            fontWeight: 700,
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
            onDelete={(id) => setTweets((prev) => prev.filter((tw) => tw._id !== id))}
          />
        ))
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
