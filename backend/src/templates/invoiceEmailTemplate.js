const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatIstDateTime = (date) =>
  `${new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })} IST`;

const formatIstDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/**
 * Generates { subject, html, text } for subscription invoices.
 */
export const renderInvoiceEmail = ({
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
  const amount = `₹${Number(amountInr).toFixed(2)}`;
  const tweets = tweetLimit === null ? 'Unlimited tweets' : `Up to ${tweetLimit} tweets`;
  const paidOn = formatIstDateTime(paidAt);
  const validUntil = formatIstDate(expiresAt);

  const row = (label, value) => `
    <tr>
      <td style="padding:10px 0;color:#536471;font-size:14px;border-bottom:1px solid #eff3f4;">${label}</td>
      <td style="padding:10px 0;color:#0f1419;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #eff3f4;">${value}</td>
    </tr>`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f7f9f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #eff3f4;border-radius:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <tr>
            <td style="padding:28px 32px 8px;">
              <div style="font-size:26px;font-weight:800;color:#1d9bf0;">Twiller</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 0;">
              <div style="font-size:22px;font-weight:800;color:#0f1419;">Your receipt</div>
              <div style="font-size:15px;color:#536471;margin-top:6px;">Hi ${escapeHtml(name)}, thanks for subscribing. Your <strong style="color:#0f1419;">${escapeHtml(planName)}</strong> plan is now active.</div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <div style="font-size:13px;font-weight:700;color:#536471;text-transform:uppercase;letter-spacing:1px;">Invoice</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
                ${row('Invoice number', escapeHtml(invoiceNumber))}
                ${row('Date', escapeHtml(paidOn))}
                ${row('Payment ID', escapeHtml(paymentId))}
                ${row('Order ID', escapeHtml(orderId))}
                ${row('Payment method', 'Razorpay')}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <div style="font-size:13px;font-weight:700;color:#536471;text-transform:uppercase;letter-spacing:1px;">Subscription plan</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
                ${row('Plan', escapeHtml(planName))}
                ${row('Tweet limit', escapeHtml(tweets))}
                ${row('Billing period', '30 days')}
                ${row('Valid until', escapeHtml(validUntil))}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9f9;border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;font-size:16px;font-weight:700;color:#0f1419;">Total paid</td>
                  <td style="padding:16px 18px;font-size:20px;font-weight:800;color:#0f1419;text-align:right;">${amount}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 28px;">
              <div style="font-size:12px;color:#71767b;line-height:1.5;">
                Your plan resets to Free after ${escapeHtml(validUntil)} unless you subscribe again.
                Keep this email as proof of payment. If you did not make this payment, please ignore this email.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    'Twiller - Your receipt',
    '',
    `Hi ${name}, your ${planName} plan is now active.`,
    '',
    `Invoice number: ${invoiceNumber}`,
    `Date: ${paidOn}`,
    `Payment ID: ${paymentId}`,
    `Order ID: ${orderId}`,
    '',
    `Plan: ${planName}`,
    `Tweet limit: ${tweets}`,
    'Billing period: 30 days',
    `Valid until: ${validUntil}`,
    '',
    `Total paid: ${amount}`,
    '',
    `Your plan resets to Free after ${validUntil} unless you subscribe again.`,
  ].join('\n');

  return {
    subject: `Your Twiller receipt - ${planName} plan (${invoiceNumber})`,
    html,
    text,
  };
};
