import { useEffect, useRef, useState } from "react";
import { Box, Dialog, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Close, DeleteOutline, FiberManualRecord, MicNone, Stop, UploadFileOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Button } from "../UI";
import AudioOtpStep from "./AudioOtpStep";
import AudioUploadStep from "./AudioUploadStep";
import useAudioRecorder from "../../helper/useAudioRecorder";
import {
  requestAudioOtpApi,
  verifyAudioOtpApi,
  uploadAudioTweetApi,
  getAudioApiError,
} from "../../Apis/audioApi";
import {
  AUDIO_LIMITS,
  AUDIO_WINDOW_LABEL,
  formatDuration,
  formatFileSize,
} from "../../helper/audioConstants";

const MAX_TWEET_LENGTH = 300;

export default function AudioTweetDialog({ open, onClose, onPosted }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { status, seconds, audio, error, start, stop, reset, loadFile, clearError } =
    useAudioRecorder();

  const [step, setStep] = useState("compose"); // 'compose' | 'otp' | 'uploading'
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpKey, setOtpKey] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [progress, setProgress] = useState(0);
  const [grantReady, setGrantReady] = useState(false);
  const fileInputRef = useRef(null);
  const abortRef = useRef(null);

  // Show recorder errors as a toast, then clear them.
  useEffect(() => {
    if (error) {
      toast.error(error, { toastId: "audio-error" });
      clearError();
    }
  }, [error, clearError]);

  const isRecording = status === "recording";
  const isStarting = status === "starting";
  const captionTooLong = caption.length > MAX_TWEET_LENGTH;
  const locked = isRecording || isStarting || busy || step === "uploading";

  const finish = () => {
    reset();
    setCaption("");
    setStep("compose");
    setProgress(0);
    setBusy(false);
    setGrantReady(false);
    onClose();
  };

  const handleClose = () => {
    if (locked) return;
    finish();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again
    if (file) await loadFile(file);
  };

  // Step 1: ask the backend to email an OTP (it also checks the time window).
  const sendOtp = async () => {
    setBusy(true);
    try {
      const data = await requestAudioOtpApi();
      setMaskedEmail(data.maskedEmail || "your email");
      setOtpKey((k) => k + 1); // clear the boxes
      setStep("otp");
      toast.success(t("audio.otpSent"));
      return true;
    } catch (err) {
      toast.error(getAudioApiError(err).message, { toastId: "audio-otp-error" });
      return false;
    } finally {
      setBusy(false);
    }
  };

  // Step 3: the OTP is correct, so upload the audio.
  const upload = async () => {
    setStep("uploading");
    setProgress(0);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const tweet = await uploadAudioTweetApi({
        file: audio.file,
        content: caption.trim(),
        onProgress: setProgress,
        signal: controller.signal,
      });
      setGrantReady(false);
      toast.success(t("audio.posted"));
      onPosted?.(tweet);
      finish();
    } catch (err) {
      const { code, message } = getAudioApiError(err);
      if (code !== "CANCELLED") setGrantReady(false);
      if (code === "CANCELLED") {
        toast.info(message);
      } else if (code === "TWEET_LIMIT_REACHED") {
        toast.error(`${message} ${t("audio.seePlans")}`, {
          onClick: () => navigate("/plans"),
          autoClose: 8000,
        });
      } else {
        toast.error(message, { toastId: "audio-upload-error" });
      }
      // These audios can never be accepted, so discard them.
      if (code === "AUDIO_TOO_LONG" || code === "AUDIO_DURATION_UNKNOWN") reset();
      setStep("compose");
    } finally {
      abortRef.current = null;
    }
  };

  const handlePost = () => (grantReady ? upload() : sendOtp());

  // Step 2: verify the OTP, then upload straight away.
  const verifyOtp = async (code) => {
    if (busy) return;
    setBusy(true);
    try {
      await verifyAudioOtpApi(code);
      setGrantReady(true);
    } catch (err) {
      toast.error(getAudioApiError(err).message, { toastId: "audio-otp-error" });
      setOtpKey((k) => k + 1); // clear and refocus the boxes
      setBusy(false);
      return;
    }
    setBusy(false);
    await upload();
  };

  const cancelUpload = () => { if (progress < 100) abortRef.current?.abort(); };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          bgcolor: "#000",
          color: "#e7e9ea",
          borderRadius: 4,
          border: "1px solid #2f3336",
          backgroundImage: "none",
        },
      }}
    >
      <Box sx={{ p: 1 }}>
        <IconButton onClick={handleClose} sx={{ color: "#e7e9ea" }} disabled={locked}>
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ px: 4, pb: 4 }}>
        {step === "otp" && (
          <AudioOtpStep
            maskedEmail={maskedEmail}
            onVerify={verifyOtp}
            onResend={sendOtp}
            onBack={() => setStep("compose")}
            busy={busy}
            otpKey={otpKey}
          />
        )}

        {step === "uploading" && <AudioUploadStep progress={progress} onCancel={cancelUpload} />}

        {step === "compose" && (
          <>
            <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 1 }}>{t("audio.title")}</Typography>

            <Box sx={{ bgcolor: "#16181c", border: "1px solid #2f3336", borderRadius: 2, p: 1.5, mb: 2.5 }}>
              <Typography sx={{ fontSize: 13, color: "#71767b", lineHeight: 1.5 }}>
                {t("audio.notice", { window: AUDIO_WINDOW_LABEL })}
              </Typography>
            </Box>

            {!audio ? (
              <Stack spacing={1.5}>
                {isRecording ? (
                  <Stack alignItems="center" spacing={1.5} sx={{ py: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FiberManualRecord sx={{ color: "#f4212e", fontSize: 14 }} />
                      <Typography sx={{ fontSize: 28, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                        {formatDuration(seconds)}
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: "#71767b" }}>
                        / {formatDuration(AUDIO_LIMITS.MAX_DURATION_SECONDS)}
                      </Typography>
                    </Stack>
                    <Button
                      onClick={stop}
                      startIcon={<Stop />}
                      sx={{ bgcolor: "#f4212e", color: "#fff", fontWeight: 700, borderRadius: 99, px: 3 }}
                    >
                      {t("audio.stopRecording")}
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    onClick={start}
                    disabled={isStarting}
                    startIcon={<MicNone />}
                    sx={{ bgcolor: "#1d9bf0", color: "#fff", fontWeight: 700, borderRadius: 99, py: 1.2 }}
                  >
                    {isStarting ? t("audio.starting") : t("audio.recordAudio")}
                  </Button>
                )}

                {!isRecording && (
                  <>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      startIcon={<UploadFileOutlined />}
                      sx={{
                        color: "#e7e9ea",
                        fontWeight: 700,
                        borderRadius: 99,
                        py: 1.2,
                        border: "1px solid #536471",
                        bgcolor: "transparent",
                      }}
                    >
                      {t("audio.chooseFile")}
                    </Button>
                    <input ref={fileInputRef} hidden type="file" accept="audio/*" onChange={handleFile} />
                  </>
                )}
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Box sx={{ bgcolor: "#16181c", border: "1px solid #2f3336", borderRadius: 2, p: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography sx={{ fontSize: 13, color: "#71767b" }}>
                      {audio.source === "recorded" ? t("audio.recordingSource") : audio.file.name}
                      {" · "}
                      {audio.durationSeconds ? formatDuration(audio.durationSeconds) : "--:--"}
                      {" · "}
                      {formatFileSize(audio.file.size)}
                    </Typography>
                    <IconButton
                      onClick={reset}
                      disabled={busy}
                      size="small"
                      sx={{ color: "#f4212e" }}
                      aria-label={t("audio.discardAudio")}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Stack>
                  <audio controls src={audio.url} style={{ width: "100%" }} />
                </Box>

                <TextField
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t("audio.captionPlaceholder")}
                  multiline
                  minRows={2}
                  fullWidth
                  variant="standard"
                  error={captionTooLong}
                  helperText={
                    captionTooLong
                      ? t("audio.maxChars", { max: MAX_TWEET_LENGTH })
                      : `${caption.length}/${MAX_TWEET_LENGTH}`
                  }
                  slotProps={{
                    input: { disableUnderline: true, sx: { fontSize: 16, color: "#fff" } },
                    formHelperText: { sx: { color: captionTooLong ? "#f4212e" : "#71767b" } },
                  }}
                />

                <Button
                  disabled={captionTooLong || busy}
                  onClick={handlePost}
                  sx={{
                    bgcolor: "#1d9bf0",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 99,
                    py: 1.2,
                    "&.Mui-disabled": { bgcolor: "rgba(29, 155, 240, 0.5)", color: "rgba(255,255,255,0.5)" },
                  }}
                >
                  {busy ? t("audio.sendingCode") : t("audio.postAudio")}
                </Button>
              </Stack>
            )}
          </>
        )}
      </Box>
    </Dialog>
  );
}
