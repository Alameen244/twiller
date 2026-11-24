import { Popover } from "@mui/material";
import EmojiPicker from "emoji-picker-react";

/**
 * Dark-themed emoji picker popover styled to match the Twiller X/Twitter UI.
 */
export default function EmojiPickerPopover({ anchorEl, onClose, onEmojiSelect }) {
  const open = Boolean(anchorEl);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            bgcolor: "#000",
            border: "1px solid #2f3336",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 0 15px rgba(255, 255, 255, 0.12)",
          },
        },
      }}
    >
      {open && (
        <EmojiPicker
          theme="dark"
          emojiStyle="twitter"
          lazyLoadEmojis
          width={320}
          height={380}
          skinTonesDisabled={false}
          previewConfig={{ showPreview: false }}
          onEmojiClick={(emojiData) => {
            onEmojiSelect(emojiData.emoji);
          }}
        />
      )}
    </Popover>
  );
}
