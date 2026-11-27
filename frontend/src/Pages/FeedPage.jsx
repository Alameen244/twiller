import { useEffect, useState } from "react";
import { Box, CircularProgress, LinearProgress, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getPostsApi } from "../Apis/tweetApi";
import TweetComposer from "../Components/TweetComposer";
import TweetCard from "../Components/TweetCard";
import LoadingSpinner from "../Components/LoadingSpinner";
import { Avatar } from "../Components/UI";
import { useAuth } from "../Context/AuthContext";
import useTweetTranslations from "../helper/useTweetTranslations";

export default function FeedPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { translations, markVisible } = useTweetTranslations();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [pendingTweet, setPendingTweet] = useState(null);

  useEffect(() => {
    getPostsApi()
      .then((data) => setTweets(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isFollowing = (tweetItem) =>
    Boolean(tweetItem.author?.followers?.includes(user?._id));

  const displayedTweets = tab === 0 ? tweets : tweets.filter(isFollowing);

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: { xs: 53, sm: 0 },
          zIndex: 2,
          bgcolor: "rgba(0,0,0,.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #2f3336",
        }}
      >
        <Typography fontSize={{ xs: 18, sm: 20 }} fontWeight={700} sx={{ p: { xs: 1.5, sm: 2 } }}>
          {t("feed.home")}
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              color: "#71767b",
              textTransform: "none",
              fontWeight: 700,
              height: 52,
            },
            "& .Mui-selected": { color: "#fff" },
          }}
        >
          <Tab label={t("feed.forYou")} />
          <Tab label={t("feed.following")} />
        </Tabs>
      </Box>

      <TweetComposer
        onTweetPosted={(tweet) => setTweets((prev) => [tweet, ...prev])}
        onPostingStart={(draft) => setPendingTweet(draft)}
        onPostingEnd={() => setPendingTweet(null)}
      />

      {/* Professional non-heavy animated posting card */}
      {pendingTweet && (
        <Box
          data-component="pending-tweet-card"
          sx={{
            p: 2,
            borderBottom: "1px solid #2f3336",
            bgcolor: "rgba(29, 155, 240, 0.03)",
            position: "relative",
            overflow: "hidden",
            animation: "fadeInPending 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            "@keyframes fadeInPending": {
              from: { opacity: 0, transform: "translateY(-8px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2.5,
              bgcolor: "rgba(29, 155, 240, 0.15)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #1d9bf0, #7856ff, #00ba7c)",
                backgroundSize: "200% 100%",
                animation: "pendingBarShimmer 1.6s linear infinite",
              },
              "@keyframes pendingBarShimmer": {
                "0%": { backgroundPosition: "100% 0" },
                "100%": { backgroundPosition: "-100% 0" },
              },
            }}
          />
          <Stack direction="row" spacing={1.75}>
            <Avatar src={user?.avatar} size={40}>
              {user?.displayName?.[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography fontWeight={700} fontSize={15} color="#fff">
                  {user?.displayName}
                </Typography>
                <Typography fontSize={14} color="#71767b">
                  @{user?.username}
                </Typography>
                <Typography fontSize={14} color="#71767b">
                  ·
                </Typography>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    bgcolor: "rgba(29, 155, 240, 0.12)",
                    color: "#1d9bf0",
                    px: 1,
                    py: 0.25,
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <CircularProgress size={10} thickness={6} sx={{ color: "#1d9bf0" }} />
                  <span>{t("composer.posting")}</span>
                </Box>
              </Stack>
              <Typography
                sx={{
                  color: "#e7e9ea",
                  mt: 0.75,
                  fontSize: 15,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {pendingTweet.content}
              </Typography>
              {pendingTweet.image && (
                <Box
                  component="img"
                  src={pendingTweet.image}
                  alt="Posting preview"
                  sx={{
                    maxHeight: 280,
                    maxWidth: "100%",
                    borderRadius: 2,
                    mt: 1.5,
                    opacity: 0.9,
                  }}
                />
              )}
            </Box>
          </Stack>
        </Box>
      )}

      {loading ? (
        <Box textAlign="center" py={8}>
          <LoadingSpinner />
          <Typography color="text.secondary" mt={2}>
            {t("feed.loadingTweets")}
          </Typography>
        </Box>
      ) : displayedTweets.length === 0 && !pendingTweet ? (
        <Box textAlign="center" py={8}>
          <Typography color="text.secondary" fontSize={18}>
            {tab === 1 ? t("feed.noFollowingTweets") : t("feed.noTweets")}
          </Typography>
        </Box>
      ) : (
        displayedTweets.map((tweet) => (
          <TweetCard
            key={tweet._id}
            tweet={tweet}
            translation={translations[tweet._id]}
            onVisible={markVisible}
            onDelete={(id) => setTweets((prev) => prev.filter((t) => t._id !== id))}
          />
        ))
      )}
    </>
  );
}
