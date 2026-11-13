const MESSAGES = {
  "auth/invalid-phone-number": "Enter a valid phone number.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/invalid-verification-code": "That code is incorrect.",
  "auth/code-expired": "That code has expired. Request a new one.",
  "auth/credential-already-in-use": "This number is linked to another account.",
  "auth/provider-already-linked": "A phone number is already linked to this account.",
  "auth/requires-recent-login": "Please log out and log in again, then retry.",
  "auth/captcha-check-failed": "Captcha check failed. Please try again.",
};

export const getPhoneErrorMessage = (e) =>
  MESSAGES[e?.code] ||
  e?.response?.data?.message ||
  e?.message ||
  "Something went wrong.";
