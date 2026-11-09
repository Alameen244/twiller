import { useEffect, useState } from "react";
import {
  Alert,
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
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../Context/AuthContext";
export default function AuthModal({ open, onClose, initialMode = "login" }) {
  const { login, signup, isLoading } = useAuth(),
    [mode, setMode] = useState(initialMode),
    [error, setError] = useState(""),
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
    )
      return setError("Please complete all required fields.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    try {
      setError("");
      mode === "login"
        ? await login(form.email, form.password)
        : await signup(
            form.email,
            form.password,
            form.username,
            form.displayName,
          );
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
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
            {error && <Alert severity="error">{error}</Alert>}
            {mode === "signup" && (
              <>
                {f("displayName", "Display name")}
                {f("username", "Username")}
              </>
            )}
            {f("email", "Email", "email")}
            {f("password", "Password", "password")}
            <Button
              type="submit"
              disabled={isLoading}
              sx={{
                bgcolor: "#1d9bf0",
                color: "#fff",
                fontWeight: 700,
                py: 1.25,
              }}
            >
              {isLoading ? (
                <LoadingSpinner size={20} />
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
                setError("");
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
