import { useEffect, useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getPostsApi } from "../Apis/tweetApi";
import TweetComposer from "../Components/TweetComposer";
import TweetCard from "../Components/TweetCard";
import LoadingSpinner from "../Components/LoadingSpinner";
import { useAuth } from "../Context/AuthContext";
import useTweetTranslations from "../helper/useTweetTranslations";

export default function FeedPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { translations, markVisible } = useTweetTranslations();
  const [tweets, setTweets] = useState([]),
    [loading, setLoading] = useState(true),
    [tab, setTab] = useState(0);
  useEffect(() => {
    getPostsApi()
      .then((data) => setTweets(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const displayedTweets = tab === 0 ? tweets : tweets.filter((t) => t.author?.followers?.includes(user?._id));

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          bgcolor: "rgba(0,0,0,.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #2f3336",
        }}
      >
        <Typography fontSize={20} fontWeight={700} sx={{ p: 2 }}>
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
      {tab === 0 && <TweetComposer onTweetPosted={(tweet) => setTweets([tweet, ...tweets])} />}
      {loading ? (
        <Box textAlign="center" py={8}>
          <LoadingSpinner />
          <Typography color="text.secondary" mt={2}>
            {t("feed.loadingTweets")}
          </Typography>
        </Box>
      ) : displayedTweets.length === 0 ? (
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
