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
      data-component="landing-page"
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "#000",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 20% 50%, rgba(29, 155, 240, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Box
        data-component="logo-section"
        sx={{
          display: { xs: "none", lg: "flex" },
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          "&:hover svg": {
            transform: "scale(1.05) rotate(5deg)",
            filter: "drop-shadow(0 0 30px rgba(29, 155, 240, 0.6))",
          },
          "& svg": {
            transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            animation: "float 6s ease-in-out infinite",
          },
          "@keyframes float": {
            "0%, 100%": {
              transform: "translateY(0px)",
            },
            "50%": {
              transform: "translateY(-20px)",
            },
          },
        }}
      >
        <TwitterLogo size={320} />
      </Box>
      <Box
        data-component="content-section"
        sx={{
          flex: 1,
          maxWidth: 640,
          px: { xs: 4, lg: 8 },
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: { xs: "block", lg: "none" },
            mb: 6,
            "&:hover svg": {
              transform: "scale(1.1) rotate(5deg)",
              filter: "drop-shadow(0 0 15px rgba(29, 155, 240, 0.5))",
            },
            "& svg": {
              transition: "all 0.4s ease",
            },
          }}
        >
          <TwitterLogo size={52} />
        </Box>
        <Typography
          data-component="main-heading"
          sx={{
            fontWeight: 800,
            fontSize: { xs: 48, lg: 64 },
            letterSpacing: -2,
            background: "linear-gradient(135deg, #fff 0%, #1d9bf0 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradient 3s ease infinite",
            backgroundSize: "200% 200%",
            "@keyframes gradient": {
              "0%, 100%": {
                backgroundPosition: "0% 50%",
              },
              "50%": {
                backgroundPosition: "100% 50%",
              },
            },
          }}
        >
          Happening now
        </Typography>
        <Typography
          data-component="sub-heading"
          sx={{
            fontSize: 31,
            fontWeight: 800,
            my: 5,
            transition: "all 0.3s ease",
            "&:hover": {
              color: "#1d9bf0",
              transform: "translateX(10px)",
            },
          }}
        >
          Join today.
        </Typography>
        <Stack spacing={1.5} sx={{ maxWidth: 300 }} data-component="action-buttons">
          <Button
            data-component="google-signup-button"
            variant="outlined"
            onClick={googlesignin}
            sx={{
              borderColor: "#536471",
              color: "#fff",
              height: 44,
              fontWeight: 700,
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                transition: "left 0.5s ease",
              },
              "&:hover": {
                borderColor: "#1d9bf0",
                backgroundColor: "rgba(29, 155, 240, 0.1)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(29, 155, 240, 0.3)",
                "&::before": {
                  left: "100%",
                },
              },
              "&:active": {
                transform: "translateY(0px)",
              },
            }}
          >
           Continue with Google
          </Button>
          <Button
            data-component="apple-signup-button"
            variant="outlined"
            onClick={googlesignin}
            sx={{
              borderColor: "#536471",
              color: "#fff",
              height: 44,
              fontWeight: 700,
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                transition: "left 0.5s ease",
              },
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(255, 255, 255, 0.2)",
                "&::before": {
                  left: "100%",
                },
              },
              "&:active": {
                transform: "translateY(0px)",
              },
            }}
          >
            Continue with Apple
          </Button>
          <Typography
            textAlign="center"
            color="text.secondary"
            data-component="divider-text"
            sx={{
              position: "relative",
              "&::before, &::after": {
                content: '""',
                position: "absolute",
                top: "50%",
                width: "40%",
                height: "1px",
                backgroundColor: "#536471",
              },
              "&::before": {
                left: 0,
              },
              "&::after": {
                right: 0,
              },
            }}
          >
            or
          </Typography>
          <Button
            data-component="create-account-button"
            onClick={() => auth("signup")}
            sx={{
              bgcolor: "#1d9bf0",
              color: "#fff",
              height: 44,
              fontWeight: 700,
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",

              "&:hover": {
                bgcolor: "#1a8cd8",
                transform: "translateY(-3px) scale(1.02)",
              },
              "&:active": {
                transform: "translateY(-1px) scale(0.98)",
              },
            }}
          >
            Create account
          </Button>
          <Typography
            fontSize={11}
            color="text.secondary"
            data-component="terms-text"
            sx={{
              transition: "color 0.3s ease",
              "&:hover": {
                color: "#1d9bf0",
              },
            }}
          >
            By signing up, you agree to the Terms of Service and Privacy Policy,
            including Cookie Use.
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              mt: 4,
              transition: "all 0.3s ease",
              "&:hover": {
                color: "#1d9bf0",
                transform: "translateX(5px)",
              },
            }}
            data-component="login-heading"
          >
            Already have an account?
          </Typography>
          <Button
            data-component="login-button"
            variant="outlined"
            onClick={() => auth("login")}
            sx={{
              borderColor: "#536471",
              color: "#1d9bf0",
              height: 44,
              fontWeight: 700,
              position: "relative",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#1d9bf0",
                backgroundColor: "#1d9bf0",
                color: "#fff",
                transform: "translateY(-2px) scale(1.02)",
                boxShadow: "0 8px 25px rgba(29, 155, 240, 0.4)",
              },
              "&:active": {
                transform: "translateY(0px)",
              },
            }}
          >
            Log in
          </Button>
        </Stack>
      </Box>
      <AuthModal
        data-component="auth-modal"
        open={open}
        onClose={() => setOpen(false)}
        initialMode={mode}
      />
    </Box>
  );
}
