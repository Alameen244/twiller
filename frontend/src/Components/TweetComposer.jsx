import { useState } from "react";
import { Box, IconButton, Stack, TextField } from "@mui/material";
import {
  ImageOutlined,
  InsertEmoticonOutlined,
  LocationOnOutlined,
  Public,
} from "@mui/icons-material";
import client from "../Apis/client";
import { endpoints } from "../Apis/EndPoints/endpoints";
import { Avatar, Button, Card } from "./UI";
import { useAuth } from "../Context/AuthContext";
export default function TweetComposer({ onTweetPosted }) {
  const { user } = useAuth();
  const [content, setContent] = useState(""),
    [image, setImage] = useState(""),
    [busy, setBusy] = useState(false);
  if (!user) return null;
  const post = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    try {
      const res = await client.post(endpoints.posts, {
        author: user._id,
        content,
        image,
      });
      onTweetPosted(res.data);
      setContent("");
      setImage("");
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };
  const upload = (e) => {
    const f = e.target.files?.[0];
    if (f) setImage(URL.createObjectURL(f));
  };
  return (
    <Card
      component="form"
      onSubmit={post}
      sx={{ borderWidth: "0 0 1px", p: 2 }}
    >
      <Stack direction="row" spacing={2}>
        <Avatar src={user.avatar} sx={{ width: 48, height: 48 }}>
          {user.displayName?.[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <TextField
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            multiline
            minRows={4}
            fullWidth
            variant="standard"
            slotProps={{
              input: {
                disableUnderline: true,
                sx: {
                  fontSize: 20,
                  color: "#fff",
                  "& textarea::placeholder": { color: "#71767b", opacity: 1 },
                },
              },
            }}
            inputProps={{ maxLength: 200 }}
          />
          {image && (
            <Box
              component="img"
              src={image}
              alt="Preview"
              sx={{ maxHeight: 220, maxWidth: "100%", borderRadius: 2, my: 1 }}
            />
          )}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1 }}
          >
            <Stack direction="row">
              <IconButton component="label" sx={{ color: "#1d9bf0" }}>
                <ImageOutlined />
                <input hidden type="file" accept="image/*" onChange={upload} />
              </IconButton>
              <IconButton sx={{ color: "#1d9bf0" }}>
                <InsertEmoticonOutlined />
              </IconButton>
              <IconButton sx={{ color: "#1d9bf0" }}>
                <LocationOnOutlined />
              </IconButton>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Stack
                direction="row"
                sx={{ color: "#1d9bf0", display: { xs: "none", sm: "flex" } }}
              >
                <Public fontSize="small" />
                <Box sx={{ fontSize: 13, fontWeight: 700, ml: 0.5 }}>
                  Everyone can reply
                </Box>
              </Stack>
              <Button
                type="submit"
                disabled={busy || !content.trim()}
                sx={{
                  bgcolor: "#1d9bf0",
                  color: "#fff",
                  fontWeight: 700,
                  px: 2.5,
                }}
              >
                Post
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
