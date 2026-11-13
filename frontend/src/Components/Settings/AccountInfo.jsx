import { useState } from "react";
import { Box, Button  } from "@mui/material";
import AccountInfoRow from "./AccountInfoRow";
import PhoneVerifyDialog from "./PhoneVerifyDialog";
import { pillButtonSx } from "./settingsStyles";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

export default function AccountInfo({ user }) {
  const [phoneOpen, setPhoneOpen] = useState(false);
  if (!user) return null;

  return (
    <Box>
      <AccountInfoRow label="Name" value={user.displayName} />
      <AccountInfoRow label="Username" value={`@${user.username}`} />
      <AccountInfoRow label="Email" value={user.email} />
      <AccountInfoRow label="Joined" value={formatDate(user.joinedDate)} />
      <AccountInfoRow label="Location" value={user.location || "Not set"} />

      {user.phoneNumber ? (
        <AccountInfoRow
          label="Phone number"
          value={user.phoneNumber}
          verified={user.isPhoneVerified}
        />
      ) : (
        <AccountInfoRow
          warning
          label="Phone number"
          value="No mobile number registered"
          hint="Add a mobile number to secure your account and recover your password."
            action={
            <Button onClick={() => setPhoneOpen(true)} sx={pillButtonSx}>
              Register mobile number
            </Button>

          }
        />
      )}

      <PhoneVerifyDialog open={phoneOpen} onClose={() => setPhoneOpen(false)} />
    </Box>
  );
}
