import { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ImageOutlined,
  InsertEmoticonOutlined,
  LocationOnOutlined,
  MicNone,
  Public,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { uploadSingleImage } from "../Apis/imageApi";
import { createPostApi } from "../Apis/tweetApi";
import { Avatar, Button, Card } from "./UI";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../Context/AuthContext";
import UsageIndicator from "./UsageIndicator";
import AudioTweetDialog from "./Audio/AudioTweetDialog";

const MAX_TWEET_LENGTH = 300;

export default function TweetComposer({ onTweetPosted }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usageRefresh, setUsageRefresh] = useState(0);
  const [audioOpen, setAudioOpen] = useState(false);
  const [content, setContent] = useState(""),
    [image, setImage] = useState(""),
    [imagePreview, setImagePreview] = useState(""),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  if (!user) return null;

  const length = content.length;
  const isOverLimit = length > MAX_TWEET_LENGTH;
  const isNearLimit = length >= 280;

  let charColor = "#1d9bf0";
  if (isOverLimit) {
    charColor = "#f4212e";
  } else if (isNearLimit) {
    charColor = "#ffd400";
  }

  const post = async (e) => {
    e.preventDefault();
    if (!content.trim() || isOverLimit) return;
    setBusy(true);
    try {
      const tweetData = await createPostApi({
        author: user._id,
        content,
        image,
      });
      onTweetPosted(tweetData);
      setUsageRefresh((n) => n + 1); // update the usage ring

      // Cleanup blob URL after successful post
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setContent("");
      setImage("");
      setImagePreview("");
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (data?.code === "TWEET_LIMIT_REACHED") {
        // Clicking the toast opens the Premium modal.
        toast.error(t("composer.limitReached"), {
          onClick: () => navigate("/plans"),
          autoClose: 8000,
        });
      } else {
        toast.error(
          data?.error ||
            data?.message ||
            t("composer.postFailed"),
        );
      }
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

  // An audio tweet was posted from the dialog: show it in the feed and refresh the usage ring.
  const handleAudioPosted = (tweet) => {
    onTweetPosted(tweet);
    setUsageRefresh((n) => n + 1);
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
            placeholder={t("composer.placeholder")}
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
            <Box
              sx={{ color: "#1d9bf0", fontSize: 14, my: 1 }}
              data-component="upload-status"
            >
              {t("composer.uploadingImage")}
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
              <IconButton
                component="label"
                sx={{ color: "#1d9bf0" }}
                data-component="image-upload-button"
              >
                <ImageOutlined />
                <input hidden type="file" accept="image/*" onChange={upload} />
              </IconButton>
              <IconButton
                sx={{ color: "#1d9bf0" }}
                data-component="emoji-button"
              >
                <InsertEmoticonOutlined />
              </IconButton>
              <IconButton
                sx={{ color: "#1d9bf0" }}
                data-component="location-button"
              >
                <LocationOnOutlined />
              </IconButton>
              <IconButton
                sx={{ color: "#1d9bf0" }}
                onClick={() => setAudioOpen(true)}
                aria-label={t("composer.audioTweet")}
                data-component="audio-tweet-button"
              >
                <MicNone />
              </IconButton>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Tooltip title={t("composer.everyoneCanReply")}>
                <Stack
                  data-component="reply-settings"
                  direction="row"
                  sx={{
                    color: "#1d9bf0",
                    display: { xs: "none", sm: "flex" },
                    alignItems: "center",
                    cursor: "pointer",
                    py: 0.5,
                    px: length > 0 ? 0.5 : 1,
                    borderRadius: 99,
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "rgba(29, 155, 240, 0.1)" },
                  }}
                >
                  <Public fontSize="small" />
                  {length === 0 && (
                    <Box sx={{ fontSize: 13, fontWeight: 700, ml: 0.5 }}>
                      {t("composer.everyoneCanReply")}
                    </Box>
                  )}
                </Stack>
              </Tooltip>

              {length > 0 && (
                <>
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                    }}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={28}
                      thickness={3}
                      sx={{ color: "#333639" }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={Math.min(length / MAX_TWEET_LENGTH, 1) * 100}
                      size={28}
                      thickness={3}
                      sx={{
                        color: charColor,
                        position: "absolute",
                        left: 0,
                        top: 0,
                        "& .MuiCircularProgress-circle": {
                          strokeLinecap: "round",
                        },
                      }}
                    />
                    {isNearLimit && (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: charColor,
                            lineHeight: 1,
                            letterSpacing: "-0.5px",
                          }}
                        >
                          {MAX_TWEET_LENGTH - length}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box
                    sx={{
                      width: "1px",
                      height: 20,
                      bgcolor: "#2f3336",
                    }}
                  />
                </>
              )}

              <UsageIndicator refreshKey={usageRefresh} />

              <Button
                data-component="post-button"
                type="submit"
                disabled={
                  busy || uploading || !content.trim() || isOverLimit
                }
                sx={{
                  bgcolor: "#1d9bf0",
                  color: "#fff",
                  fontWeight: 700,
                  px: 2.5,
                  borderRadius: 99,
                  "&.Mui-disabled": {
                    bgcolor: "rgba(29, 155, 240, 0.5)",
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                }}
              >
                {uploading ? t("composer.uploading") : t("composer.post")}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      <AudioTweetDialog
        open={audioOpen}
        onClose={() => setAudioOpen(false)}
        onPosted={handleAudioPosted}
      />
    </Card>
  );
}
