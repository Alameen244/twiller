// Every reason we send an email OTP. One active OTP is kept per user per purpose.
export const OTP_PURPOSES = {
  PASSWORD_RESET: 'password-reset',
  LOGIN: 'login',
  AUDIO_UPLOAD: 'audio-upload',
  LANGUAGE_CHANGE: 'language-change',
};
