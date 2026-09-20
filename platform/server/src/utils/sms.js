/**
 * SMS utility — pluggable provider.
 * Set SMS_PROVIDER in .env to: msg91 | twilio | fast2sms
 * If no valid credentials exist, OTPs are logged to console (dev mode).
 */

const sendSms = async (phone, message) => {
  const provider = process.env.SMS_PROVIDER;
  const apiKey   = process.env.SMS_API_KEY;

  if (!apiKey || apiKey === 'REPLACE_WITH_YOUR_SMS_KEY') {
    // ── DEV fallback: print OTP to console ─────────────────────
    console.log(`\n📱 [SMS DEV] To: ${phone} | Message: ${message}\n`);
    return { success: true, dev: true };
  }

  if (provider === 'msg91') {
    // MSG91: https://docs.msg91.com/
    const axios = require('axios');
    const resp  = await axios.post(
      'https://api.msg91.com/api/sendotp.php',
      null,
      {
        params: {
          authkey: apiKey,
          mobile:  `91${phone}`,
          message,
          otp: message.match(/\d{6}/)?.[0],
          sender: 'FWATCH'
        }
      }
    );
    return resp.data;

  } else if (provider === 'fast2sms') {
    const axios = require('axios');
    const resp  = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      { route: 'q', message, numbers: phone },
      { headers: { authorization: apiKey } }
    );
    return resp.data;

  } else if (provider === 'twilio') {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
    const msg = await client.messages.create({
      body: message,
      from: process.env.TWILIO_FROM,
      to:   `+91${phone}`
    });
    return { success: true, sid: msg.sid };

  } else {
    console.warn(`[SMS] Unknown provider: ${provider}. OTP not sent.`);
    return { success: false };
  }
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

module.exports = { sendSms, generateOtp };
