import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { Avatar } from "./UI";

const SUGGESTED_ACCOUNTS = [
  {
    name: "React Dev",
    username: "reactIsGoat",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCAYMv1jbc0kdTHF3vJ0Sn57BXeyCp8TROOpCMs4Z9Ev8SnHVbGeM0JSE&s=10",
    initialFollowed: false,
  },
  {
    name: "JavaScript Daily",
    username: "JavaScriptDaily",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZmDsXahQPXtfG6auJhfC55-a3MHhGWn5xTYp7oyVnSQ&s=10",
    initialFollowed: false,
  },
  {
    name: "Kubernetes",
    username: "kubernetesio",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS32_jdQUousPoZNsq71eBi7FozCOicS_ODzZak19E1mA&s=10",
    initialFollowed: false,
  },
  {
    name: "DevOps Zone",
    username: "devopszone",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVz7sf2KDL_jVzoQhQ3gCq7ASfOH0HZ5GuR84b7pNEjw&s=10",
    initialFollowed: false,
  },
  {
    name: "System Design",
    username: "systemdesignhub",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsuK98UBFFvcMzXP8Y4rx6lDHyrfG-ULlZ7icCWeUEEw&s=10",
    initialFollowed: false,
  },
];

export default function WhoToFollow() {
  const [followingMap, setFollowingMap] = useState({});

  const toggleFollow = (username) => {
    setFollowingMap((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  return (
    <Box
      data-component="who-to-follow"
      sx={{
        bgcolor: "#16181c",
        overflow: "hidden",
        border: "1px solid #2f3336",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={800}
        sx={{ px: 2, pt: 1.5, pb: 1, fontSize: 18 }}
      >
        You might like
      </Typography>

      <Stack>
        {SUGGESTED_ACCOUNTS.map((acc) => {
          const isFollowing = !!followingMap[acc.username];
          return (
            <Box
              key={acc.username}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.25,
                transition: "background-color 0.2s",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, mr: 1 }}>
                <Avatar
                  src={acc.avatar}
                  alt={acc.name}
                  sx={{ width: 40, height: 40 }}
                >
                  {acc.name[0]}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography
                      fontWeight={700}
                      fontSize={15}
                      noWrap
                      sx={{
                        color: "#fff",
                        "&:hover": { textDecoration: "underline" },
                        cursor: "pointer",
                      }}
                    >
                      {acc.name}
                    </Typography>
                    <CheckCircle
                      sx={{
                        color: "#1d9bf0",
                        fontSize: 16,
                      }}
                    />
                  </Stack>
                  <Typography
                    fontSize={14}
                    color="#71767b"
                    noWrap
                  >
                    @{acc.username}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant={isFollowing ? "outlined" : "contained"}
                onClick={() => toggleFollow(acc.username)}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  px: 2,
                  py: 0.5,
                  minWidth: 80,
                  bgcolor: isFollowing ? "transparent" : "#fff",
                  color: isFollowing ? "#fff" : "#000",
                  borderColor: isFollowing ? "#536471" : "transparent",
                  "&:hover": {
                    bgcolor: isFollowing ? "rgba(244, 33, 46, 0.1)" : "#e6e6e6",
                    color: isFollowing ? "#f4212e" : "#000",
                    borderColor: isFollowing ? "#f4212e" : "transparent",
                  },
                }}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </Box>
          );
        })}
      </Stack>

      <Box
        sx={{
          p: 1.75,
          cursor: "pointer",
          transition: "background-color 0.2s",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.03)",
          },
        }}
      >
        <Typography
          fontSize={14}
          sx={{
            color: "#1d9bf0",
            fontWeight: 500,
          }}
        >
          Show more
        </Typography>
      </Box>
    </Box>
  );
}
