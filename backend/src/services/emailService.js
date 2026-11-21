import 'dotenv/config';
import { OTP_PURPOSES } from '../constants/otpPurposes.js';

const { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } = process.env;
if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
  throw new Error('Missing BREVO_API_KEY / BREVO_SENDER_EMAIL in backend .env');
}

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

// Plain HTTPS call (port 443), so it works on Render's free plan, unlike SMTP.
const sendEmail = async ({ to, subject, html, text }) => {
  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: BREVO_SENDER_NAME || 'Twiller', email: BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('Brevo send failed:', res.status, detail); // visible in Render logs
    throw new Error('EMAIL_SEND_FAILED');
  }
};

export const sendPasswordResetOtpEmail = ({ to, otp, validMinutes }) =>
  sendEmail({
    to,
    subject: 'Your Twiller password reset code',
    text: `Your Twiller password reset code is ${otp}. It is valid for ${validMinutes} minutes. If you did not request this, you can ignore this email.`,
    html: `<p>Your Twiller password reset code is:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px">${otp}</p>
<p>It is valid for ${validMinutes} minutes. If you did not request this, you can ignore this email.</p>`,
  });
// Subject and wording for every OTP purpose except password reset (it keeps its own function above).
const OTP_EMAIL_CONTENT = {
  [OTP_PURPOSES.LOGIN]: {
    subject: 'Your Twiller login verification code',
    reason: 'login verification',
  },
  [OTP_PURPOSES.AUDIO_UPLOAD]: {
    subject: 'Your Twiller audio upload verification code',
    reason: 'audio upload verification',
  },
  [OTP_PURPOSES.LANGUAGE_CHANGE]: {
    subject: 'Your Twiller language change verification code',
    reason: 'language change verification',
  },
};

export const sendOtpEmail = ({ to, otp, validMinutes, purpose }) => {
  const content = OTP_EMAIL_CONTENT[purpose];
  if (!content) throw new Error('UNKNOWN_OTP_PURPOSE');
  return sendEmail({
    to,
    subject: content.subject,
    text: `Your Twiller ${content.reason} code is ${otp}. It is valid for ${validMinutes} minutes. If you did not request this, you can ignore this email.`,
    html: `<p>Your Twiller ${content.reason} code is:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px">${otp}</p>
<p>It is valid for ${validMinutes} minutes. If you did not request this, you can ignore this email.</p>`,
  });
};
