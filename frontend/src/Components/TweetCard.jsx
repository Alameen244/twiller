import { useState } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  MoreHoriz,
  Repeat,
  ChatBubbleOutline,
  Share,
} from "@mui/icons-material";
import { axiosInstance } from "../helper/helper";
import { endpoints } from "../Apis/EndPoints/endpoints";
import { Avatar, Card } from "./UI";
import { useAuth } from "../Context/AuthContext";
const n = (x = 0) => (x >= 1000 ? `${(x / 1000).toFixed(1)}K` : x);
export default function TweetCard({ tweet }) {
  const { user } = useAuth();
  const [item, setItem] = useState(tweet);
  const like = async () => {
    try {
      setItem(
        (await axiosInstance.post(endpoints.like(item._id), { userId: user?._id }))
          .data,
      );
    } catch (e) {
      console.error(e);
    }
  };
  const retweet = async () => {
    try {
      setItem(
        (await axiosInstance.post(endpoints.retweet(item._id), { userId: user?._id }))
          .data,
      );
    } catch (e) {
      console.error(e);
    }
  };
  const liked = item.likedBy?.includes(user?._id),
    reposted = item.retweetedBy?.includes(user?._id);
  const author = item.author || {};
  return (
    <Card
      data-component="tweet-card"
      data-tweet-id={item._id}
      sx={{ borderWidth: "0 0 1px", p: 2, "&:hover": { bgcolor: "#080808" } }}
    >
      <Stack direction="row" spacing={1.5} data-component="tweet-content">
        <Avatar
          data-component="avatar"
          data-location="tweet-card"
          data-author={author.username}
          src={author.avatar}
          alt={author.displayName}
          sx={{ width: 48, height: 48 }}
        >
          {author.displayName?.[0]}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }} data-component="tweet-body">
          <Stack direction="row" spacing={0.75} alignItems="center" data-component="tweet-header">
            <Typography fontWeight={700}>{author.displayName}</Typography>
            <Typography color="text.secondary">@{author.username}</Typography>
            <Typography color="text.secondary">·</Typography>
            <Typography color="text.secondary">
              {item.timestamp &&
                new Date(item.timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
            </Typography>
            <IconButton sx={{ ml: "auto", color: "#71767b" }}>
              <MoreHoriz />
            </IconButton>
          </Stack>
          <Typography sx={{ whiteSpace: "pre-wrap", my: 1 }}>
            {item.content}
          </Typography>
          {item.image && item.image.startsWith('http') && (
            <Box
              data-component="tweet-image"
              data-image-url={item.image}
              component="img"
              src={item.image}
              alt="Tweet attachment"
              sx={{
                width: "100%",
                maxHeight: 384,
                objectFit: "cover",
                borderRadius: 2,
                mb: 1.5,
              }}
            />
          )}
          <Stack
            data-component="tweet-actions"
            direction="row"
            justifyContent="space-between"
            sx={{ maxWidth: 440, color: "#71767b" }}
          >
            <IconButton sx={{ color: "inherit" }} data-component="comment-button">
              <ChatBubbleOutline />
              <Typography variant="caption" sx={{ ml: 0.75 }}>
                {n(item.comments)}
              </Typography>
            </IconButton>
            <IconButton
              data-component="retweet-button"
              onClick={retweet}
              sx={{ color: reposted ? "#00ba7c" : "inherit" }}
            >
              <Repeat />
              <Typography variant="caption" sx={{ ml: 0.75 }}>
                {n(item.retweets)}
              </Typography>
            </IconButton>
            <IconButton
              data-component="like-button"
              onClick={like}
              sx={{ color: liked ? "#f91880" : "inherit" }}
            >
              {liked ? <Favorite /> : <FavoriteBorder />}
              <Typography variant="caption" sx={{ ml: 0.75 }}>
                {n(item.likes)}
              </Typography>
            </IconButton>
            <IconButton sx={{ color: "inherit" }} data-component="share-button">
              <Share />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
