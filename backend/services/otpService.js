/**
 * OTP Service — Fast2SMS
 * Generates, stores (in-memory with expiry), and verifies 6-digit OTPs.
 * Sends OTPs via Fast2SMS REST API (free Indian SMS service).
 */
const https = require('https');

// In-memory OTP store: { phone → { otp, expiresAt, attempts } }
const otpStore = new Map();

const OTP_EXPIRY_MS  = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS   = 5;               // max wrong guesses before OTP invalidated

// ── Generate a 6-digit OTP ────────────────────────────────────────────────────
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// ── Send OTP via Fast2SMS ─────────────────────────────────────────────────────
const sendOtp = (phone) => {
  return new Promise((resolve, reject) => {
    const otp = generateOtp();

    // Store OTP
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      attempts: 0,
    });

    const message = `Your AirAssist verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    const apiKey  = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      return reject(new Error('FAST2SMS_API_KEY not configured in .env'));
    }

    const params = new URLSearchParams({
      authorization: apiKey,
      route:         'q',          // Quick transactional route
      message:       message,
      language:      'english',
      flash:         '0',
      numbers:       phone,
    });

    const options = {
      hostname: 'www.fast2sms.com',
      path:     `/dev/bulkV2?${params.toString()}`,
      method:   'GET',
      headers: {
        'cache-control': 'no-cache',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.return === true) {
            resolve({ success: true, message: 'OTP sent successfully' });
          } else {
            reject(new Error(parsed.message || 'Failed to send SMS'));
          }
        } catch {
          reject(new Error('Invalid response from Fast2SMS'));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
};

// ── Verify OTP ────────────────────────────────────────────────────────────────
const verifyOtp = (phone, inputOtp) => {
  const record = otpStore.get(phone);

  if (!record) {
    return { valid: false, message: 'No OTP found for this number. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phone);
    return { valid: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (record.otp !== String(inputOtp).trim()) {
    record.attempts += 1;
    return { valid: false, message: `Incorrect OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining.` };
  }

  // Valid — clear from store
  otpStore.delete(phone);
  return { valid: true, message: 'OTP verified successfully.' };
};

module.exports = { sendOtp, verifyOtp };
