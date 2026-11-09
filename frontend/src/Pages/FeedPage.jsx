import { useEffect, useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import client from "../Apis/client";
import { endpoints } from "../Apis/EndPoints/endpoints";
import TweetComposer from "../Components/TweetComposer";
import TweetCard from "../Components/TweetCard";
import LoadingSpinner from "../Components/LoadingSpinner";
import { useAuth } from "../Context/AuthContext";

export default function FeedPage() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]),
    [loading, setLoading] = useState(true),
    [tab, setTab] = useState(0);
  useEffect(() => {
    client
      .get(endpoints.posts)
      .then((r) => setTweets(r.data || []))
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
          Home
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
          <Tab label="For you" />
          <Tab label="Following" />
        </Tabs>
      </Box>
      {tab === 0 && <TweetComposer onTweetPosted={(tweet) => setTweets([tweet, ...tweets])} />}
      {loading ? (
        <Box textAlign="center" py={8}>
          <LoadingSpinner />
          <Typography color="text.secondary" mt={2}>
            Loading tweets...
          </Typography>
        </Box>
      ) : displayedTweets.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography color="text.secondary" fontSize={18}>
            {tab === 1 ? "No tweets from people you follow yet" : "No tweets yet"}
          </Typography>
        </Box>
      ) : (
        displayedTweets.map((tweet) => <TweetCard key={tweet._id} tweet={tweet} />)
      )}
    </>
  );
}
