import { useEffect, useRef, useState } from "react";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  MoreHoriz,
  Repeat,
  ChatBubbleOutline,
  Share,
  DeleteOutline,
  GraphicEq,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { deletePostApi, likePostApi, retweetPostApi } from "../Apis/tweetApi";
import { formatDuration } from "../helper/audioConstants";
import { Avatar, Card } from "./UI";
import { useAuth } from "../Context/AuthContext";
import DeletePostDialog from "./DeletePostDialog";

const n = (x = 0) => (x >= 1000 ? `${(x / 1000).toFixed(1)}K` : x);

// translation: { text, translated } from useTweetTranslations. onVisible(id): tells the page this tweet is on screen.
export default function TweetCard({ tweet, onDelete, translation, onVisible }) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [item, setItem] = useState(tweet);
  const [showOriginal, setShowOriginal] = useState(false);
  const bodyRef = useRef(null);

  // ── More menu ──
  const [menuAnchor, setMenuAnchor] = useState(null);
  const openMenu = (e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); };
  const closeMenu = () => setMenuAnchor(null);

  // ── Delete dialog ──
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Report once when the tweet (with text) comes near the screen, so the page can translate it in a batch.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || !onVisible || !item.content?.trim()) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      onVisible(item._id);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          onVisible(item._id);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [item._id, item.content, onVisible]);

  const isOwn = user?._id && item.author?._id === user._id;

  const like = async () => {
    try {
      setItem(await likePostApi(item._id, user?._id));
    } catch (e) {
      console.error(e);
    }
  };

  const retweet = async () => {
    try {
      setItem(await retweetPostApi(item._id, user?._id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deletePostApi(item._id);
      toast.success(t("tweet.deleted"));
      setConfirmOpen(false);
      onDelete?.(item._id);       // tell parent to remove from list
    } catch (err) {
      toast.error(
        err?.response?.data?.error || t("tweet.deleteFailed"),
      );
    } finally {
      setDeleting(false);
    }
  };

  const liked = item.likedBy?.includes(user?._id);
  const reposted = item.retweetedBy?.includes(user?._id);
  const author = item.author || {};
  const hasAudio = Boolean(item.audio?.url);

  // Show the translation unless the user asked for the original (or the tweet was already in this language).
  const isTranslated = Boolean(translation?.translated);
  const shownText = isTranslated && !showOriginal ? translation.text : item.content;

  return (
    <>
      <Card
        data-component="tweet-card"
        data-tweet-id={item._id}
        sx={{ borderWidth: "0 0 1px", p: { xs: 1.5, sm: 2 }, "&:hover": { bgcolor: "#080808" } }}
      >
        <Stack direction="row" spacing={{ xs: 1.25, sm: 1.5 }} data-component="tweet-content">
          <Avatar
            data-component="avatar"
            data-location="tweet-card"
            data-author={author.username}
            src={author.avatar}
            alt={author.displayName}
            sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, flexShrink: 0 }}
          >
            {author.displayName?.[0]}
          </Avatar>
          <Box ref={bodyRef} sx={{ minWidth: 0, flex: 1 }} data-component="tweet-body">
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ minWidth: 0 }}
              data-component="tweet-header"
            >
              <Typography fontWeight={700} noWrap sx={{ minWidth: 0, flexShrink: 1 }}>
                {author.displayName}
              </Typography>
              <Typography color="text.secondary" noWrap sx={{ minWidth: 0, flexShrink: 2 }}>
                @{author.username}
              </Typography>
              <Typography color="text.secondary" sx={{ flexShrink: 0 }}>
                ·
              </Typography>
              <Typography color="text.secondary" sx={{ flexShrink: 0, whiteSpace: "nowrap" }}>
                {item.timestamp &&
                  new Date(item.timestamp).toLocaleDateString(i18n.language || "en", {
                    month: "short",
                    day: "numeric",
                  })}
              </Typography>

              {/* Only render menu button for own posts */}
              {isOwn && (
                <IconButton
                  data-component="more-button"
                  sx={{ ml: "auto", color: "#71767b", flexShrink: 0 }}
                  onClick={openMenu}
                >
                  <MoreHoriz />
                </IconButton>
              )}
              {!isOwn && (
                <IconButton sx={{ ml: "auto", color: "#71767b", flexShrink: 0 }}>
                  <MoreHoriz />
                </IconButton>
              )}
            </Stack>

            {/* Caption (optional on audio tweets) */}
            {item.content && (
              <>
                <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", my: 1 }}>
                  {shownText}
                </Typography>
                {isTranslated && (
                  <Typography
                    component="button"
                    type="button"
                    data-component="translation-toggle"
                    onClick={() => setShowOriginal((v) => !v)}
                    sx={{
                      background: "none",
                      border: 0,
                      p: 0,
                      mb: 1,
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#1d9bf0",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {showOriginal ? t("tweet.showTranslated") : t("tweet.showOriginal")}
                  </Typography>
                )}
              </>
            )}

            {item.image && item.image.startsWith("http") && (
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

            {/* Audio player (audio tweets only) */}
            {hasAudio && (
              <Box
                data-component="tweet-audio"
                sx={{
                  bgcolor: "#16181c",
                  border: "1px solid #2f3336",
                  borderRadius: 2,
                  p: 1.5,
                  my: 1,
                  mb: 1.5,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1, color: "#1d9bf0" }}>
                  <GraphicEq fontSize="small" />
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                    {t("tweet.audioTweet")}
                    {item.audio.duration ? ` · ${formatDuration(item.audio.duration)}` : ""}
                  </Typography>
                </Stack>
                <audio
                  controls
                  preload="metadata"
                  src={item.audio.url}
                  style={{ width: "100%" }}
                />
              </Box>
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

      {/* ── More menu (own posts only) ── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#000",
              border: "1px solid #2f3336",
              color: "#fff",
              minWidth: 200,
            },
          },
        }}
      >
        <MenuItem
          data-component="delete-menu-item"
          onClick={() => { closeMenu(); setConfirmOpen(true); }}
          sx={{ color: "#f4212e" }}
        >
          <ListItemIcon sx={{ color: "#f4212e" }}>
            <DeleteOutline fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("tweet.delete")} />
        </MenuItem>
      </Menu>

      {/* ── Confirmation dialog ── */}
      <DeletePostDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </>
  );
}
