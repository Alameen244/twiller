import { OTP_PURPOSES } from '../constants/otpPurposes.js';

const OTP_EMAIL_CONFIG = {
  [OTP_PURPOSES.LOGIN]: {
    subject: 'Your Twiller login verification code',
    reason: 'login verification',
    heading: 'Confirm your login',
  },
  [OTP_PURPOSES.AUDIO_UPLOAD]: {
    subject: 'Your Twiller audio upload verification code',
    reason: 'audio upload verification',
    heading: 'Verify audio upload',
  },
  [OTP_PURPOSES.LANGUAGE_CHANGE]: {
    subject: 'Your Twiller language change verification code',
    reason: 'language change verification',
    heading: 'Verify language change',
  },
  [OTP_PURPOSES.PASSWORD_RESET]: {
    subject: 'Your Twiller password reset code',
    reason: 'password reset',
    heading: 'Reset your password',
  },
};

/**
 * Builds a Twitter / X styled HTML template for OTP verification emails.
 */
const buildOtpHtml = ({ otp, validMinutes, heading, reason }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background-color:#ffffff;border:1px solid #eff3f4;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          
          <!-- Twitter / X Brand Header -->
          <tr>
            <td align="center" style="padding:32px 32px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <svg viewBox="0 0 24 24" width="36" height="36" style="display:block;fill:#1d9bf0;">
                      <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
                    </svg>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading & Intro -->
          <tr>
            <td style="padding:0 36px 8px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#0f1419;letter-spacing:-0.4px;">
                ${heading}
              </h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:22px;color:#536471;">
                There's one quick step you need to complete for your Twiller account. Enter this verification code to complete your ${reason}:
              </p>
            </td>
          </tr>

          <!-- OTP Badge Card -->
          <tr>
            <td style="padding:16px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:#f7f9f9;border:1px solid #cfd9de;border-radius:12px;padding:20px 24px;">
                    <div style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,Courier,monospace;font-size:34px;font-weight:800;letter-spacing:8px;color:#0f1419;text-align:center;margin-left:8px;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiration & Security Notice -->
          <tr>
            <td style="padding:0 36px 24px;text-align:center;">
              <p style="margin:0 0 12px;font-size:14px;line-height:20px;color:#0f1419;font-weight:600;">
                This code is valid for ${validMinutes} minutes.
              </p>
              <p style="margin:0;font-size:13px;line-height:18px;color:#71767b;">
                Verification codes are sensitive. For your security, never share this code with anyone. If you didn't request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Twitter-like Footer -->
          <tr>
            <td style="padding:24px 36px;border-top:1px solid #eff3f4;background-color:#ffffff;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#71767b;line-height:16px;">
                This is an automated notification from Twiller Security.
              </p>
              <p style="margin:0;font-size:12px;color:#71767b;line-height:16px;">
                Twiller, Inc. &bull; The global town square clone
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const buildOtpText = ({ otp, validMinutes, reason }) =>
  [
    `Twiller - ${reason.toUpperCase()}`,
    '',
    `Your Twiller ${reason} code is: ${otp}`,
    '',
    `This code is valid for ${validMinutes} minutes.`,
    'For security, do not share this code with anyone.',
    '',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n');

/**
 * Returns formatted { subject, html, text } for general OTP purposes (login, audio upload, language change).
 */
export const renderOtpEmail = ({ otp, validMinutes, purpose }) => {
  const config = OTP_EMAIL_CONFIG[purpose];
  if (!config) throw new Error('UNKNOWN_OTP_PURPOSE');

  return {
    subject: config.subject,
    html: buildOtpHtml({
      otp,
      validMinutes,
      heading: config.heading,
      reason: config.reason,
    }),
    text: buildOtpText({
      otp,
      validMinutes,
      reason: config.reason,
    }),
  };
};

/**
 * Returns formatted { subject, html, text } for password reset OTP.
 */
export const renderPasswordResetOtpEmail = ({ otp, validMinutes }) => {
  const config = OTP_EMAIL_CONFIG[OTP_PURPOSES.PASSWORD_RESET];

  return {
    subject: config.subject,
    html: buildOtpHtml({
      otp,
      validMinutes,
      heading: config.heading,
      reason: config.reason,
    }),
    text: buildOtpText({
      otp,
      validMinutes,
      reason: config.reason,
    }),
  };
};
