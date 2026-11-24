// Keywords that trigger a notification 
export const NOTIFICATION_KEYWORDS = ["cricket", "science"];

// Case-insensitive, whole word. No "g" flag on purpose (a global regex keeps state between .test() calls).
export const NOTIFICATION_KEYWORD_REGEX = new RegExp(
  `\\b(${NOTIFICATION_KEYWORDS.join("|")})\\b`,
  "i"
);

// Returns the matched keyword in lowercase ("cricket" / "science"), or null if there is no match.
// Used for normal tweet text and for audio-tweet captions.
export const findNotificationKeyword = (text) => {
  if (typeof text !== "string" || !text) return null;
  const match = text.match(NOTIFICATION_KEYWORD_REGEX);
  return match ? match[1].toLowerCase() : null;
};

// Notifications older than this are deleted automatically (TTL index).
export const NOTIFICATION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
