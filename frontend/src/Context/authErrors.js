import i18n from "../i18n";

const ERROR_KEYS = {
  // ── Login ──
  "auth/invalid-credential": "invalidCredential",
  "auth/wrong-password": "wrongPassword",
  "auth/user-not-found": "userNotFound",
  "auth/invalid-email": "invalidEmail",
  "auth/user-disabled": "userDisabled",

  // ── Signup ──
  "auth/email-already-in-use": "emailInUse",
  "auth/weak-password": "weakPassword",
  "auth/operation-not-allowed": "operationNotAllowed",

  // ── Rate-limiting / network ──
  "auth/too-many-requests": "tooManyRequests",
  "auth/network-request-failed": "networkFailed",

  // ── Popup / OAuth ──
  "auth/popup-closed-by-user": "popupClosed",
  "auth/popup-blocked": "popupBlocked",
  "auth/cancelled-popup-request": "popupCancelled",
  "auth/account-exists-with-different-credential": "accountExistsDifferent",
};

const DEFAULT_MESSAGES = {
  invalidCredential: "Incorrect email or password. Please try again.",
  wrongPassword: "Incorrect email or password. Please try again.",
  userNotFound: "Incorrect email or password. Please try again.",
  invalidEmail: "Please enter a valid email address.",
  userDisabled: "This account has been disabled. Contact support for help.",
  emailInUse: "An account with this email already exists. Try signing in instead.",
  weakPassword: "Password is too weak — use at least 6 characters with a mix of letters and numbers.",
  operationNotAllowed: "This sign-in method is currently disabled. Please contact support.",
  tooManyRequests: "Too many attempts. Please wait a moment and try again.",
  networkFailed: "Network error — check your internet connection and try again.",
  popupClosed: "Sign-in popup was closed before completing. Please try again.",
  popupBlocked: "Sign-in popup was blocked by your browser. Please allow popups and try again.",
  popupCancelled: "Only one sign-in popup can be open at a time.",
  accountExistsDifferent: "An account already exists with a different sign-in method. Try another way to log in.",
};

export const getAuthErrorMessage = (e) => {
  const code = e?.code;
  const key = ERROR_KEYS[code];
  if (key) {
    return i18n.t(`authErrors.${key}`, DEFAULT_MESSAGES[key]);
  }
  return (
    e?.response?.data?.message ||
    e?.message ||
    i18n.t("authErrors.default", "Something went wrong. Please try again later.")
  );
};
