import { useEffect, useState } from "react";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Close, Visibility, VisibilityOff } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Button } from "./UI";
import TwitterLogo from "./TwitterLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { toast } from 'react-toastify';

export default function AuthModal({ open, onClose, initialMode = "login" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, signup, isLoading } = useAuth(),
    [mode, setMode] = useState(initialMode),
    [showPassword, setShowPassword] = useState(false),
    [form, setForm] = useState({
      email: "",
      password: "",
      username: "",
      displayName: "",
    });
  useEffect(() => {
    setMode(initialMode);
    setShowPassword(false);
  }, [initialMode, open]);

  const f = (name, label, type = "text") => {
    const isPassword = name === "password";
    return (
      <TextField
        label={label}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        fullWidth
        InputProps={
          isPassword
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                      sx={{ color: "#71767b" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : undefined
        }
        sx={{
          "& label": { color: "#71767b" },
          "& input": { color: "#fff" },
          "& fieldset": { borderColor: "#536471" },
          "& .MuiInputAdornment-root": { color: "#71767b" },
        }}
      />
    );
  };
  const submit = async (e) => {
    e.preventDefault();
    if (
      !form.email ||
      !form.password ||
      (mode === "signup" && (!form.username || !form.displayName))
    ) {
      toast.warn(t("auth.requiredFields"));
      return;
    }
    if (form.password.length < 6) {
      toast.warn(t("auth.passwordMinLength"));
      return;
    }
    try {
      mode === "login"
        ? await login(form.email, form.password)
        : await signup(
            form.email,
            form.password,
            form.username,
            form.displayName,
          );
      onClose();
    } catch {
      // Toast is already shown by AuthContext — nothing else needed here.
    }
  };
  return (
    <Dialog
      data-component="auth-modal"
      data-mode={mode}
      open={open}
      onClose={isLoading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { bgcolor: "#000", border: "1px solid #2f3336", color: "#fff" },
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, position: "relative" }}>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12, color: "#fff" }}
        >
          <Close />
        </IconButton>
        <Stack alignItems="center" spacing={3}>
          <TwitterLogo size={50} />
          <Typography variant="h5" fontWeight={700}>
            {mode === "login" ? t("auth.signInToX") : t("auth.createYourAccount")}
          </Typography>
          <Stack component="form" onSubmit={submit} spacing={2} width="100%">
            {mode === "signup" && (
              <>
                {f("displayName", t("auth.displayName"))}
                {f("username", t("auth.username"))}
              </>
            )}
            {f("email", t("auth.email"), "email")}
            {f("password", t("auth.password"), "password")}
             {mode === "login" && (
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/forgot-password");
                }}
                sx={{ color: "#1d9bf0", alignSelf: "flex-end", fontWeight: 700 }}
              >
                {t("auth.forgotPassword")}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              sx={{
                bgcolor: "#1d9bf0",
                color: "#fff",
                fontWeight: 700,
                py: 1.25,
                "&:disabled": {
                  bgcolor: "rgba(29, 155, 240, 0.5)",
                  color: "#fff",
                  cursor: "not-allowed",
                },
              }}
            >
              {isLoading ? (
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <CircularProgress size={18} sx={{ color: "#fff" }} />
                  <span>{mode === "login" ? t("auth.signingIn") : t("auth.creatingAccount")}</span>
                </Stack>
              ) : mode === "login" ? (
                t("auth.signIn")
              ) : (
                t("auth.createAccount")
              )}
            </Button>
          </Stack>
          <Typography color="text.secondary" textAlign="center">
            {mode === "login"
              ? t("auth.dontHaveAccount")
              : t("auth.alreadyHaveAccount")}{" "}
            <Button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
              }}
              sx={{ color: "#1d9bf0", fontWeight: 700 }}
            >
              {mode === "login" ? t("auth.signUp") : t("auth.signIn")}
            </Button>
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
