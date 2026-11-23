// The six supported UI languages. Codes match the frontend locale files (src/locales/<code>.json).
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français' },
};

export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGE_CODES = Object.keys(LANGUAGES);

export const isSupportedLanguage = (code) =>
  typeof code === 'string' && SUPPORTED_LANGUAGE_CODES.includes(code);

// Mentor's rule: French is verified by email OTP, every other language by mobile OTP.
export const OTP_CHANNELS = { EMAIL: 'email', SMS: 'sms' };

export const getOtpChannelForLanguage = (code) =>
  code === 'fr' ? OTP_CHANNELS.EMAIL : OTP_CHANNELS.SMS;
