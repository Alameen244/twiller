import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Button } from "../Components/UI";
import TwitterLogo from "../Components/TwitterLogo";
import AuthModal from "../Components/AuthModal";
import { useAuth } from "../Context/AuthContext";
export default function LandingPage() {
  const [open, setOpen] = useState(false),
    [mode, setMode] = useState("signup");
  const { googlesignin } = useAuth();
  const auth = (m) => {
    setMode(m);
    setOpen(true);
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "#000",
        color: "#fff",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TwitterLogo size={320} />
      </Box>
      <Box
        sx={{
          flex: 1,
          maxWidth: 640,
          px: { xs: 4, lg: 8 },
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: { xs: "block", lg: "none" }, mb: 6 }}>
          <TwitterLogo size={52} />
        </Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: 48, lg: 64 },
            letterSpacing: -2,
          }}
        >
          Happening now
        </Typography>
        <Typography sx={{ fontSize: 31, fontWeight: 800, my: 5 }}>
          Join today.
        </Typography>
        <Stack spacing={1.5} sx={{ maxWidth: 300 }}>
          <Button
            variant="outlined"
            onClick={googlesignin}
            sx={{
              borderColor: "#536471",
              color: "#fff",
              height: 44,
              fontWeight: 700,
            }}
          >
            Sign up with Google
          </Button>
          <Button
            variant="outlined"
            onClick={googlesignin}
            sx={{
              borderColor: "#536471",
              color: "#fff",
              height: 44,
              fontWeight: 700,
            }}
          >
            Sign up with Apple
          </Button>
          <Typography textAlign="center" color="text.secondary">
            or
          </Typography>
          <Button
            onClick={() => auth("signup")}
            sx={{
              bgcolor: "#1d9bf0",
              color: "#fff",
              height: 44,
              fontWeight: 700,
            }}
          >
            Create account
          </Button>
          <Typography fontSize={11} color="text.secondary">
            By signing up, you agree to the Terms of Service and Privacy Policy,
            including Cookie Use.
          </Typography>
          <Typography sx={{ fontWeight: 700, mt: 4 }}>
            Already have an account?
          </Typography>
          <Button
            variant="outlined"
            onClick={() => auth("login")}
            sx={{
              borderColor: "#536471",
              color: "#1d9bf0",
              height: 44,
              fontWeight: 700,
            }}
          >
            Log in
          </Button>
        </Stack>
      </Box>
      <AuthModal
        open={open}
        onClose={() => setOpen(false)}
        initialMode={mode}
      />
    </Box>
  );
}
