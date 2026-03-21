import nodemailer from 'nodemailer';

/**
 * Send a password-reset OTP email.
 */
export const sendOTPEmail = async (to, name, otp) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('EMAIL_USER or EMAIL_PASS environment variable is not set.');
  }

  // Use explicit SMTP settings (port 587 + STARTTLS) — more reliable than service:'gmail'
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,          // STARTTLS — upgrades after connection
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,  // avoid self-signed cert issues in dev
    },
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password – MaidMatch</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 60%,#0ea5e9 100%);padding:44px 40px 36px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 20px;margin-bottom:18px;">
              <span style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                Maid<span style="color:#93c5fd;">Match</span>
              </span>
            </div>
            <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">
              Password Reset Request
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 20px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e293b;">Hello, ${name} 👋</p>
            <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
              We received a request to reset the password for your MaidMatch account.
              Use the one-time code below — it expires in <strong style="color:#1e293b;">10 minutes</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr><td align="center">
                <div style="display:inline-block;background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px solid #93c5fd;border-radius:16px;padding:24px 48px;text-align:center;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#3b82f6;letter-spacing:2px;text-transform:uppercase;">Your OTP Code</p>
                  <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:12px;color:#1e3a5f;font-family:'Courier New',monospace;">${otp}</p>
                </div>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;">
              <tr><td>
                <p style="margin:0;font-size:13px;color:#9a3412;line-height:1.5;">
                  <strong>Didn't request this?</strong> You can safely ignore this email.
                </p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1e3a5f;">MaidMatch — Trusted Home Services</p>
            <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} MaidMatch. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  await transporter.sendMail({
    from: `"MaidMatch" <${user}>`,
    to,
    subject: `${otp} is your MaidMatch password reset code`,
    html,
  });
};
