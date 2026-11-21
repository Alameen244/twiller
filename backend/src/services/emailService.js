import 'dotenv/config';
import { renderOtpEmail, renderPasswordResetOtpEmail } from '../templates/otpEmailTemplate.js';
import { renderInvoiceEmail } from '../templates/invoiceEmailTemplate.js';

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

/**
 * Sends a password reset OTP email using the Twitter-styled template.
 */
export const sendPasswordResetOtpEmail = ({ to, otp, validMinutes }) => {
  const { subject, html, text } = renderPasswordResetOtpEmail({ otp, validMinutes });
  return sendEmail({ to, subject, html, text });
};

/**
 * Sends an OTP verification email for login, audio upload, or language change.
 */
export const sendOtpEmail = ({ to, otp, validMinutes, purpose }) => {
  const { subject, html, text } = renderOtpEmail({ otp, validMinutes, purpose });
  return sendEmail({ to, subject, html, text });
};

/**
 * Sends a subscription invoice email after successful payment verification.
 */
export const sendInvoiceEmail = ({
  to,
  name,
  invoiceNumber,
  planName,
  amountInr,
  tweetLimit, // null = unlimited
  paymentId,
  orderId,
  paidAt,
  expiresAt,
}) => {
  const { subject, html, text } = renderInvoiceEmail({
    name,
    invoiceNumber,
    planName,
    amountInr,
    tweetLimit,
    paymentId,
    orderId,
    paidAt,
    expiresAt,
  });

  return sendEmail({ to, subject, html, text });
};
