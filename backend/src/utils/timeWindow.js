import 'dotenv/config';
import { getISTMinutesOfDay } from './istDate.js';

// Local testing only: BYPASS_TIME_WINDOWS=true in backend/.env skips every time window.
// It is ignored when NODE_ENV is "production", so a forgotten variable can't weaken the live site.
const isBypassEnabled = () =>
  process.env.BYPASS_TIME_WINDOWS === 'true' && process.env.NODE_ENV !== 'production';

// Takes a window from constants/timeWindows.js. Always calculated in IST, never in server time.
export const isWithinTimeWindow = ({ startHour, endHour }, date = new Date()) => {
  if (isBypassEnabled()) return true;
  const minutes = getISTMinutesOfDay(date);
  return minutes >= startHour * 60 && minutes < endHour * 60;
};
