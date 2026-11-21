const MESSAGES = {
  // ── Login ──
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/wrong-password": "Incorrect email or password. Please try again.",
  "auth/user-not-found": "Incorrect email or password. Please try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",

  // ── Signup ──
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/weak-password": "Password is too weak — use at least 6 characters with a mix of letters and numbers.",
  "auth/operation-not-allowed": "This sign-in method is currently disabled. Please contact support.",

  // ── Rate-limiting / network ──
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error — check your internet connection and try again.",

  // ── Popup / OAuth ──
  "auth/popup-closed-by-user": "Sign-in popup was closed before completing. Please try again.",
  "auth/popup-blocked": "Sign-in popup was blocked by your browser. Please allow popups and try again.",
  "auth/cancelled-popup-request": "Only one sign-in popup can be open at a time.",
  "auth/account-exists-with-different-credential": "An account already exists with a different sign-in method. Try another way to log in.",
};

export const getAuthErrorMessage = (e) =>
  MESSAGES[e?.code] ||
  e?.response?.data?.message ||
  e?.message ||
  "Something went wrong. Please try again later.";
