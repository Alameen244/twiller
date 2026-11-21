// Calendar day as seen in India Standard Time (UTC+05:30, no daylight saving).
// Used as the key for the "one password reset per day" rule.
const istFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Returns 'YYYY-MM-DD' for the given moment, as it is in IST.
export const getISTDayKey = (date = new Date()) => {
  const parts = Object.fromEntries(
    istFormatter.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const istTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// Minutes since midnight in IST (0 to 1439). Used for the daily time windows.
export const getISTMinutesOfDay = (date = new Date()) => {
  const parts = Object.fromEntries(
    istTimeFormatter.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return Number(parts.hour) * 60 + Number(parts.minute);
};
