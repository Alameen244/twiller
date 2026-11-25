export const tweetLimitText = (limit, t) => {
  if (t) {
    if (limit === null) return t("plans.limits.unlimited");
    if (limit === 1) return t("plans.limits.one");
    return t("plans.limits.upTo", { limit });
  }
  if (limit === null) return "Unlimited tweets";
  if (limit === 1) return "Post 1 tweet";
  return `Post up to ${limit} tweets`;
};

export const formatDate = (iso, lang = "en-IN") =>
  new Date(iso).toLocaleDateString(lang || "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const PLAN_BENEFITS = {
  free: [
    "Post only 1 tweet",
    "Full timeline browsing",
    "Standard reply ranking",
    "Basic search & bookmarks",
  ],
  bronze: [
    "Post up to 3 tweets",
    "Reply boost in conversations",
    "Verified account eligibility",
    "30-day active validity",
  ],
  silver: [
    "Post up to 5 tweets",
    "Audio upload verification",
    "Higher reply & search boost",
    "30-day active validity",
  ],
  gold: [
    "Unlimited tweets",
    "Gold creator badge access",
    "Unlimited audio uploads",
    "Highest priority ranking",
    "30-day active validity",
  ],
};

export const getPlanBenefits = (planId, t) => {
  if (t) {
    const list = t(`plans.benefitsList.${planId}`, { returnObjects: true });
    if (Array.isArray(list)) return list;
  }
  return PLAN_BENEFITS[planId] || [];
};

export const modalDialogStyles = {
  bgcolor: "#0a0a0c",
  backgroundImage: "none",
  color: "#ffffff",
  borderRadius: { xs: "16px", sm: "24px" },
  border: "1px solid #2f3336",
  p: { xs: 2, sm: 3, md: 3.5 },
  m: { xs: 1.5, sm: 3 },
  width: { xs: "calc(100% - 24px)", sm: "calc(100% - 48px)" },
  maxHeight: "92dvh",
  overflowY: "auto",
  position: "relative",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85)",
  scrollbarWidth: "thin",
  scrollbarColor: "#2f3336 transparent",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#2f3336",
    borderRadius: "9999px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#536471",
  },
};
