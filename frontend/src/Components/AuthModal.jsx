import { useEffect, useState } from "react";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { Button } from "./UI";
import TwitterLogo from "./TwitterLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { toast } from 'react-toastify';

export default function AuthModal({ open, onClose, initialMode = "login" }) {
  const navigate = useNavigate();
  const { login, signup, isLoading } = useAuth(),
    [mode, setMode] = useState(initialMode),
    [form, setForm] = useState({
      email: "",
      password: "",
      username: "",
      displayName: "",
    });
  useEffect(() => setMode(initialMode), [initialMode, open]);
  const f = (name, label, type = "text") => (
    <TextField
      label={label}
      type={type}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      fullWidth
      sx={{
        "& label": { color: "#71767b" },
        "& input": { color: "#fff" },
        "& fieldset": { borderColor: "#536471" },
      }}
    />
  );
  const submit = async (e) => {
    e.preventDefault();
    if (
      !form.email ||
      !form.password ||
      (mode === "signup" && (!form.username || !form.displayName))
    ) {
      toast.warn("Please complete all required fields.");
      return;
    }
    if (form.password.length < 6) {
      toast.warn("Password must be at least 6 characters.");
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
      <DialogContent sx={{ p: 4, position: "relative" }}>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12, color: "#fff" }}
        >
          <Close />
        </IconButton>
        <Stack alignItems="center" spacing={3}>
          <TwitterLogo size={50} />
          <Typography variant="h5" fontWeight={700}>
            {mode === "login" ? "Sign in to X" : "Create your account"}
          </Typography>
          <Stack component="form" onSubmit={submit} spacing={2} width="100%">
            {mode === "signup" && (
              <>
                {f("displayName", "Display name")}
                {f("username", "Username")}
              </>
            )}
            {f("email", "Email", "email")}
            {f("password", "Password", "password")}
             {mode === "login" && (
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/forgot-password");
                }}
                sx={{ color: "#1d9bf0", alignSelf: "flex-end", fontWeight: 700 }}
              >
                Forgot password?
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
                  <span>{mode === "login" ? "Signing in..." : "Creating account..."}</span>
                </Stack>
              ) : mode === "login" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
          </Stack>
          <Typography color="text.secondary">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <Button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
              }}
              sx={{ color: "#1d9bf0", fontWeight: 700 }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </Button>
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
