import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Box,
} from "@mui/material";
import { Close, PhotoCamera } from "@mui/icons-material";
import { Button } from "./UI";
import { Avatar } from "./UI";
import { useAuth } from "../Context/AuthContext";
import { uploadSingleImage } from "../Apis/imageApi";
export default function EditProfileDialog({ open, onClose }) {
  const { user, updateProfile, isLoading } = useAuth();
  const [data, setData] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    avatar: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setData({
        displayName: user.displayName || "",
        bio: user.bio || "",
        location: user.location || "Earth",
        website: user.website || "example.com",
        avatar: user.avatar || "",
      });
    }
  }, [user, open]);

  // Don't render until we have user data
  if (!user) return null;
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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadSingleImage(file, "PROFILE_PICTURE");
      setData({ ...data, avatar: result.url });
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      data-component="edit-profile-dialog"
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
      <DialogTitle fontWeight={700} data-component="dialog-title">
        Edit profile
        <IconButton onClick={onClose} sx={{ float: "right", color: "#fff" }} data-component="close-button">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent data-component="dialog-content">
        <form onSubmit={submit} data-component="edit-profile-form">
          <Stack spacing={2} mt={1}>
            <Box
              data-component="avatar-upload-section"
              sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
            >
              <Avatar
                data-component="avatar"
                data-location="edit-profile-dialog"
                data-avatar-url={data.avatar}
                src={data.avatar}
                size={80}
              >
                {data.displayName?.[0]}
              </Avatar>
              <IconButton
                data-component="avatar-upload-button"
                component="label"
                disabled={uploading}
                sx={{
                  bgcolor: "rgba(29, 155, 240, 0.1)",
                  color: "#1d9bf0",
                  "&:hover": { bgcolor: "rgba(29, 155, 240, 0.2)" },
                }}
              >
                <PhotoCamera />
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </IconButton>
              {uploading && (
                <Box sx={{ color: "#1d9bf0", fontSize: 14 }} data-component="upload-status">
                  Uploading...
                </Box>
              )}
            </Box>
            {field("displayName", "Name", 50)}
            {field("bio", "Bio", 160, true)}
            {field("location", "Location", 30)}
            {field("website", "Website", 100)}
            <Button
              data-component="save-button"
              type="submit"
              disabled={isLoading || uploading}
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
