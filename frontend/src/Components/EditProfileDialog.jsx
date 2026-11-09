import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { Button } from "./UI";
import { useAuth } from "../Context/AuthContext";
export default function EditProfileDialog({ open, onClose }) {
  const { user, updateProfile, isLoading } = useAuth();
  const [data, setData] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    avatar: "",
  });

  useEffect(() => {
    if (user)
      setData({
        displayName: user.displayName || "",
        bio: user.bio || "",
        location: user.location || "Earth",
        website: user.website || "example.com",
        avatar: user.avatar || "",
      });
  }, [user, open]);
  const field = (name, label, max, multi = false) => (
    <TextField
      label={label}
      value={data[name]}
      onChange={(e) => setData({ ...data, [name]: e.target.value })}
      slotProps={{
        htmlInput: { maxLength: max }
      }}
      multiline={multi}
      minRows={multi ? 3 : 1}
      fullWidth
      helperText={`${data[name].length}/${max}`}
      sx={{
        "& label": { color: "#71767b" },
        "& input,& textarea": { color: "#fff" },
        "& fieldset": { borderColor: "#536471" },
        "& .MuiFormHelperText-root": { textAlign: "right", color: "#71767b" },
      }}
    />
  );
  const submit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(data);
      onClose();
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { bgcolor: "#000", color: "#fff", border: "1px solid #2f3336" }
        }
      }}
    >
      <DialogTitle fontWeight={700}>
        Edit profile
        <IconButton onClick={onClose} sx={{ float: "right", color: "#fff" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={submit}>
          <Stack spacing={2} mt={1}>
            {field("displayName", "Name", 50)}
            {field("bio", "Bio", 160, true)}
            {field("location", "Location", 30)}
            {field("website", "Website", 100)}
            <Button
              type="submit"
              disabled={isLoading}
              sx={{
                alignSelf: "flex-end",
                bgcolor: "#fff",
                color: "#000",
                fontWeight: 700,
                "&:hover": {
                  bgcolor: "#e7e7e7",
                },
              }}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
