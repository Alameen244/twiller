import { useState, useEffect } from "react";
import { Box, IconButton, Stack, TextField } from "@mui/material";
import {
  ImageOutlined,
  InsertEmoticonOutlined,
  LocationOnOutlined,
  Public,
} from "@mui/icons-material";
import { axiosInstance } from "../helper/helper";
import { endpoints } from "../Apis/EndPoints/endpoints";
import { uploadSingleImage } from "../Apis/imageApi";
import { Avatar, Button, Card } from "./UI";
import { useAuth } from "../Context/AuthContext";
export default function TweetComposer({ onTweetPosted }) {
  const { user } = useAuth();
  const [content, setContent] = useState(""),
    [image, setImage] = useState(""),
    [imagePreview, setImagePreview] = useState(""),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  if (!user) return null;
  const post = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    try {
      const res = await axiosInstance.post(endpoints.posts, {
        author: user._id,
        content,
        image,
      });
      onTweetPosted(res.data);

      // Cleanup blob URL after successful post
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      setContent("");
      setImage("");
      setImagePreview("");
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };
  const upload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const blobUrl = URL.createObjectURL(f);
    setImagePreview(blobUrl);
    setUploading(true);

    try {
      const result = await uploadSingleImage(f, "POST");
      setImage(result.url);
    } catch (err) {
      console.error("Image upload failed:", err);
      setImagePreview("");
      URL.revokeObjectURL(blobUrl); // Clean up blob URL
    } finally {
      setUploading(false);
    }
  };
  return (
    <Card
      data-component="tweet-composer"
      component="form"
      onSubmit={post}
      sx={{ borderWidth: "0 0 1px", p: 2 }}
    >
      <Stack direction="row" spacing={2} data-component="composer-container">
        <Avatar
          data-component="avatar"
          data-location="tweet-composer"
          src={user.avatar}
          sx={{ width: 48, height: 48 }}
        >
          {user.displayName?.[0]}
        </Avatar>
        <Box sx={{ flex: 1 }} data-component="composer-content">
          <TextField
            data-component="tweet-input"
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
          {imagePreview && (
            <Box
              data-component="image-preview"
              component="img"
              src={imagePreview}
              alt="Preview"
              sx={{ maxHeight: 220, maxWidth: "100%", borderRadius: 2, my: 1 }}
            />
          )}
          {uploading && (
            <Box sx={{ color: "#1d9bf0", fontSize: 14, my: 1 }} data-component="upload-status">
              Uploading image...
            </Box>
          )}
          <Stack
            data-component="composer-actions"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1 }}
          >
            <Stack direction="row">
              <IconButton component="label" sx={{ color: "#1d9bf0" }} data-component="image-upload-button">
                <ImageOutlined />
                <input hidden type="file" accept="image/*" onChange={upload} />
              </IconButton>
              <IconButton sx={{ color: "#1d9bf0" }} data-component="emoji-button">
                <InsertEmoticonOutlined />
              </IconButton>
              <IconButton sx={{ color: "#1d9bf0" }} data-component="location-button">
                <LocationOnOutlined />
              </IconButton>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Stack
                data-component="reply-settings"
                direction="row"
                sx={{ color: "#1d9bf0", display: { xs: "none", sm: "flex" } }}
              >
                <Public fontSize="small" />
                <Box sx={{ fontSize: 13, fontWeight: 700, ml: 0.5 }}>
                  Everyone can reply
                </Box>
              </Stack>
              <Button
                data-component="post-button"
                type="submit"
                disabled={busy || uploading || !content.trim()}
                sx={{
                  bgcolor: "#1d9bf0",
                  color: "#fff",
                  fontWeight: 700,
                  px: 2.5,
                }}
              >
                {uploading ? "Uploading..." : "Post"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
