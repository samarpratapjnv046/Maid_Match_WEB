import nodemailer from 'nodemailer';

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) throw new Error('EMAIL_USER or EMAIL_PASS environment variable is not set.');
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
};

/**
 * Send a password-reset OTP email.
 */
export const sendOTPEmail = async (to, name, otp) => {
  const transporter = createTransporter();
  const user = process.env.EMAIL_USER;

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

/**
 * Send an email OTP to verify identity during registration.
 */
export const sendRegisterOTPEmail = async (to, name, otp) => {
  const transporter = createTransporter();
  const user = process.env.EMAIL_USER;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email – MaidMatch</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
        <tr>
          <td style="background:linear-gradient(135deg,#1B2B4B 0%,#2563eb 60%,#C9A84C 100%);padding:44px 40px 36px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 20px;margin-bottom:18px;">
              <span style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                Maid<span style="color:#C9A84C;">Match</span>
              </span>
            </div>
            <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">
              Email Verification
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 20px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e293b;">Welcome, ${name}! 👋</p>
            <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
              Use the code below to verify your email and complete your MaidMatch registration.
              It expires in <strong style="color:#1e293b;">10 minutes</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr><td align="center">
                <div style="display:inline-block;background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px solid #93c5fd;border-radius:16px;padding:24px 48px;text-align:center;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#3b82f6;letter-spacing:2px;text-transform:uppercase;">Your Verification Code</p>
                  <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:12px;color:#1B2B4B;font-family:'Courier New',monospace;">${otp}</p>
                </div>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;">
              <tr><td>
                <p style="margin:0;font-size:13px;color:#9a3412;line-height:1.5;">
                  <strong>Didn't sign up?</strong> You can safely ignore this email — no account has been created yet.
                </p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1B2B4B;">MaidMatch — Trusted Home Services</p>
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
    subject: `${otp} is your MaidMatch verification code`,
    html,
  });
};

/**
 * Send a bank account OTP verification email to a worker.
 */
export const sendBankOTPEmail = async (to, name, otp) => {
  const transporter = createTransporter();
  const user = process.env.EMAIL_USER;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bank Account Verification – MaidMatch</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
        <tr>
          <td style="background:linear-gradient(135deg,#1B2B4B 0%,#2563eb 60%,#C9A84C 100%);padding:44px 40px 36px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 20px;margin-bottom:18px;">
              <span style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                Maid<span style="color:#C9A84C;">Match</span>
              </span>
            </div>
            <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">
              Bank Account Verification
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 20px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e293b;">Hello, ${name} 👋</p>
            <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
              Use the one-time code below to verify your bank account on MaidMatch.
              It expires in <strong style="color:#1e293b;">10 minutes</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr><td align="center">
                <div style="display:inline-block;background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #C9A84C;border-radius:16px;padding:24px 48px;text-align:center;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#92400e;letter-spacing:2px;text-transform:uppercase;">Your OTP Code</p>
                  <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:12px;color:#1B2B4B;font-family:'Courier New',monospace;">${otp}</p>
                </div>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;">
              <tr><td>
                <p style="margin:0;font-size:13px;color:#9a3412;line-height:1.5;">
                  <strong>Didn't request this?</strong> Someone may be trying to update your bank details. Please contact support immediately.
                </p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1B2B4B;">MaidMatch — Trusted Home Services</p>
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
    subject: `${otp} is your MaidMatch bank verification code`,
    html,
  });
};

/**
 * Send a congratulations email to a worker whose profile has been verified by admin.
 * @param {string} to      - Worker's email address
 * @param {string} name    - Worker's full name
 */
export const sendWorkerVerifiedEmail = async (to, name) => {
  const transporter = createTransporter();
  const emailUser = process.env.EMAIL_USER;
  const appUrl = process.env.CLIENT_URL || 'https://maidmatch.in';
  const dashboardUrl = `${appUrl}/worker/dashboard`;
  const profileUrl = `${appUrl}/worker/profile`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>You're Verified! – MaidMatch</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="max-width:580px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1B2B4B 0%,#2563eb 70%,#C9A84C 100%);padding:44px 40px 36px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 24px;margin-bottom:16px;">
              <span style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                Maid<span style="color:#C9A84C;">Match</span>
              </span>
            </div>
            <div style="background:rgba(255,255,255,0.2);border-radius:50%;width:72px;height:72px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
              <span style="font-size:38px;">🎉</span>
            </div>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;">Congratulations!</p>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Your profile has been officially verified</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 28px;">
            <p style="margin:0 0 10px;font-size:22px;font-weight:700;color:#1e293b;">Hello, ${name}! 👋</p>
            <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.7;">
              We're thrilled to let you know that our admin team has <strong style="color:#1B2B4B;">reviewed and verified</strong>
              your profile on <strong>MaidMatch</strong>. You are now a trusted, verified professional on our platform —
              clients can see your verified badge and book you with full confidence.
            </p>

            <!-- Verified badge strip -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr><td align="center">
                <div style="display:inline-block;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border:2px solid #34d399;border-radius:14px;padding:18px 36px;text-align:center;">
                  <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#065f46;letter-spacing:2px;text-transform:uppercase;">Status</p>
                  <p style="margin:0;font-size:20px;font-weight:900;color:#065f46;">✅ Verified Professional</p>
                </div>
              </td></tr>
            </table>

            <!-- What to do next -->
            <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:#1e293b;">What to do next:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #C9A84C;border-radius:0 8px 8px 0;background:#fffbeb;padding:0;margin-bottom:28px;">
              <tr><td style="padding:18px 20px;">
                <p style="margin:0 0 10px;font-size:14px;color:#44403c;line-height:1.7;">
                  <strong>1. Complete your profile</strong> — Add a professional photo, detailed bio, and list all services you offer so clients can find you easily.
                </p>
                <p style="margin:0 0 10px;font-size:14px;color:#44403c;line-height:1.7;">
                  <strong>2. Stay active</strong> — Log in regularly and respond to booking requests quickly. Workers who respond fast get more bookings.
                </p>
                <p style="margin:0 0 10px;font-size:14px;color:#44403c;line-height:1.7;">
                  <strong>3. Set your availability</strong> — Keep your schedule up to date so clients know when you're free.
                </p>
                <p style="margin:0;font-size:14px;color:#44403c;line-height:1.7;">
                  <strong>4. Deliver great service</strong> — 5-star reviews from clients will boost your ranking and bring more work your way.
                </p>
              </td></tr>
            </table>

            <!-- CTA Buttons -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td align="center" style="padding-bottom:12px;">
                  <a href="${dashboardUrl}"
                     style="display:inline-block;background:linear-gradient(135deg,#1B2B4B,#2563eb);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                    Go to My Dashboard →
                  </a>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <a href="${profileUrl}"
                     style="display:inline-block;background:#ffffff;color:#1B2B4B;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:10px;border:2px solid #1B2B4B;letter-spacing:0.3px;">
                    Complete My Profile
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;text-align:center;">
              If you have any questions, reply to this email or contact our support team.<br/>
              We're here to help you succeed! 💪
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1B2B4B;">MaidMatch — Trusted Home Services</p>
            <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} MaidMatch. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  await transporter.sendMail({
    from: `"MaidMatch" <${emailUser}>`,
    to,
    subject: `🎉 Congratulations ${name}! Your MaidMatch profile is now Verified`,
    html,
  });
};
