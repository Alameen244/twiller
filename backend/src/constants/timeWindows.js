// Daily time windows in IST, on a 24-hour clock. The start is included, the end is not.
export const TIME_WINDOWS = {
  MOBILE_LOGIN: { startHour: 10, endHour: 13, label: '10:00 AM and 1:00 PM IST' },
  PAYMENT: { startHour: 10, endHour: 11, label: '10:00 AM and 11:00 AM IST' }, // used by the subscription task
  AUDIO_UPLOAD: { startHour: 14, endHour: 19, label: '2:00 PM and 7:00 PM IST' }, // used by the audio task
};
