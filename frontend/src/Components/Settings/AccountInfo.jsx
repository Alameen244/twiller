import { useState } from "react";
import { Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import AccountInfoRow from "./AccountInfoRow";
import PhoneVerifyDialog from "./PhoneVerifyDialog";
import { pillButtonSx } from "./settingsStyles";

const formatDate = (d, lang = "en") =>
  d
    ? new Date(d).toLocaleDateString(lang, { month: "long", day: "numeric", year: "numeric" })
    : "—";

export default function AccountInfo({ user }) {
  const { t, i18n } = useTranslation();
  const [phoneOpen, setPhoneOpen] = useState(false);
  if (!user) return null;

  return (
    <Box>
      <AccountInfoRow label={t("account.name")} value={user.displayName} />
      <AccountInfoRow label={t("account.username")} value={`@${user.username}`} />
      <AccountInfoRow label={t("account.email")} value={user.email} />
      <AccountInfoRow label={t("account.joined")} value={formatDate(user.joinedDate, i18n.language)} />
      <AccountInfoRow label={t("account.location")} value={user.location || t("account.notSet")} />

      {user.phoneNumber ? (
        <AccountInfoRow
          label={t("account.phoneNumber")}
          value={user.phoneNumber}
          verified={user.isPhoneVerified}
        />
      ) : (
        <AccountInfoRow
          warning
          label={t("account.phoneNumber")}
          value={t("account.noPhone")}
          hint={t("account.phoneHint")}
          action={
            <Button onClick={() => setPhoneOpen(true)} sx={pillButtonSx}>
              {t("account.registerPhone")}
            </Button>
          }
        />
      )}

      <PhoneVerifyDialog open={phoneOpen} onClose={() => setPhoneOpen(false)} />
    </Box>
  );
}
