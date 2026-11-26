import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  createCommentApi,
  deleteCommentApi,
  getCommentsApi,
} from "../Apis/commentApi";
import { useAuth } from "../Context/AuthContext";
import { Avatar } from "./UI";

const MAX_COMMENT_LENGTH = 280;

export default function CommentSection({ tweetId, open, onCountChange }) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [comments, setComments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const onCountChangeRef = useRef(onCountChange);

  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

  useEffect(() => {
    if (!open || loaded) return undefined;
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await getCommentsApi(tweetId);
        if (!active) return;
        setComments(Array.isArray(res?.comments) ? res.comments : []);
        setLoaded(true);
        if (typeof res?.commentsCount === "number") {
          onCountChangeRef.current?.(res.commentsCount);
        }
      } catch (err) {
        if (active) {
          toast.error(err?.response?.data?.error || t("comments.loadFailed"));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [open, loaded, tweetId, t]);

  const trimmed = text.trim();
  const remaining = MAX_COMMENT_LENGTH - text.length;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!trimmed || submitting || remaining < 0) return;

    setSubmitting(true);
    try {
      const res = await createCommentApi(tweetId, trimmed);
      if (res?.comment) {
        setComments((prev) => [res.comment, ...prev]);
        setLoaded(true);
      }
      if (typeof res?.commentsCount === "number") {
        onCountChange?.(res.commentsCount);
      }
      setText("");
    } catch (err) {
      toast.error(err?.response?.data?.error || t("comments.createFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (deletingId) return;
    setDeletingId(commentId);
    try {
      const res = await deleteCommentApi(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (typeof res?.commentsCount === "number") {
        onCountChange?.(res.commentsCount);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || t("comments.deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Collapse in={open} timeout={220} unmountOnExit>
      <Box
        data-component="comment-section"
        onClick={(e) => e.stopPropagation()}
        sx={{
          mt: 1.25,
          pt: 1.5,
          borderTop: "1px solid #2f3336",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.25,
            pb: 1.5,
            borderBottom: "1px solid #1e2024",
          }}
        >
          <Avatar
            src={user?.avatar}
            alt={user?.displayName}
            sx={{ width: 32, height: 32, mt: 0.25, flexShrink: 0 }}
          >
            {user?.displayName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <InputBase
              data-component="comment-input"
              fullWidth
              multiline
              maxRows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  handleSubmit(e);
                }
              }}
              placeholder={t("comments.placeholder")}
              inputProps={{ maxLength: MAX_COMMENT_LENGTH }}
              sx={{
                color: "#f7f9f9",
                fontSize: 14,
                lineHeight: 1.4,
                py: 0.5,
                "& textarea::placeholder": { color: "#71767b", opacity: 1 },
              }}
            />
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              spacing={1.25}
              sx={{ mt: 0.75 }}
            >
              {text.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: remaining <= 20 ? "#f4212e" : "#71767b",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {remaining}
                </Typography>
              )}
              <Button
                data-component="comment-submit"
                type="submit"
                size="small"
                variant="contained"
                disabled={!trimmed || submitting || remaining < 0}
                sx={{
                  bgcolor: "#1d9bf0",
                  "&:hover": { bgcolor: "#1a8cd8" },
                  "&.Mui-disabled": {
                    bgcolor: "rgba(29, 155, 240, 0.35)",
                    color: "rgba(255, 255, 255, 0.55)",
                  },
                  color: "#fff",
                  borderRadius: 99,
                  px: 2,
                  minHeight: 30,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                {submitting ? (
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                ) : (
                  t("comments.reply")
                )}
              </Button>
            </Stack>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2.5 }}>
            <CircularProgress size={20} sx={{ color: "#1d9bf0" }} />
          </Box>
        ) : comments.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 2, textAlign: "center", fontSize: 13 }}
          >
            {t("comments.empty")}
          </Typography>
        ) : (
          <Stack divider={<Box sx={{ borderBottom: "1px solid #1e2024" }} />}>
            {comments.map((comment) => {
              const cAuthor = comment.author || {};
              const isMine = user?._id && cAuthor._id === user._id;
              return (
                <Stack
                  key={comment._id}
                  data-component="comment-item"
                  direction="row"
                  spacing={1.25}
                  sx={{ py: 1.25 }}
                >
                  <Avatar
                    src={cAuthor.avatar}
                    alt={cAuthor.displayName}
                    sx={{ width: 32, height: 32, flexShrink: 0 }}
                  >
                    {cAuthor.displayName?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} fontSize={14} noWrap sx={{ minWidth: 0 }}>
                        {cAuthor.displayName}
                      </Typography>
                      <Typography color="text.secondary" fontSize={13} noWrap sx={{ minWidth: 0 }}>
                        @{cAuthor.username}
                      </Typography>
                      <Typography color="text.secondary" fontSize={13} sx={{ flexShrink: 0 }}>
                        ·
                      </Typography>
                      <Typography
                        color="text.secondary"
                        fontSize={12.5}
                        sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
                      >
                        {comment.timestamp &&
                          new Date(comment.timestamp).toLocaleString(i18n.language || "en", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                      </Typography>
                      {isMine && (
                        <IconButton
                          data-component="comment-delete-button"
                          size="small"
                          aria-label={t("comments.delete")}
                          disabled={deletingId === comment._id}
                          onClick={() => handleDelete(comment._id)}
                          sx={{
                            ml: "auto",
                            color: "#71767b",
                            p: 0.4,
                            "&:hover": { color: "#f4212e" },
                          }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize: 14,
                        lineHeight: 1.4,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        color: "#e7e9ea",
                      }}
                    >
                      {comment.content}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>
    </Collapse>
  );
}
