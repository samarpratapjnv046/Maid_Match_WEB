import logger from './logger.js';

/**
 * Send an SMS via Fast2SMS (https://fast2sms.com).
 * Requires FAST2SMS_API_KEY in environment.
 * If the key is not set this function is a no-op — the OTP still reaches the user by email.
 *
 * @param {string} phone - 10-digit Indian mobile number (without country code)
 * @param {string} otp   - 6-digit OTP to send
 */
export const sendOTPSMS = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    logger.warn('FAST2SMS_API_KEY not set — skipping SMS delivery');
    return;
  }

  // Strip country code prefix if present
  const digits = String(phone).replace(/\D/g, '').replace(/^91/, '');
  if (digits.length !== 10) {
    logger.warn(`sendOTPSMS: invalid phone number "${phone}" — skipping`);
    return;
  }

  const body = JSON.stringify({
    variables_values: otp,
    route: 'otp',
    numbers: digits,
  });

  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error(`Fast2SMS error (${res.status}): ${text}`);
    return;
  }

  const json = await res.json();
  if (!json.return) {
    logger.error('Fast2SMS rejected the request:', json);
  } else {
    logger.info(`OTP SMS sent to ${digits}`);
  }
};
