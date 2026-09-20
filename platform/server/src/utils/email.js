const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your@gmail.com') {
    console.log(`\n📧 [EMAIL DEV] To: ${to} | Subject: ${subject}\n`);
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"FoodWatch" <noreply@foodwatch.in>',
    to,
    subject,
    html
  });
};

// ── Email templates ───────────────────────────────────────────────
const emailTemplates = {
  otpVerification: (name, otp) => ({
    subject: 'FoodWatch — Verify your phone',
    html: `<p>Hi ${name},</p><p>Your OTP is: <strong style="font-size:24px">${otp}</strong></p><p>Valid for 10 minutes.</p>`
  }),
  donationClaimed: (donorName, foodName, receiverName) => ({
    subject: `Your donation "${foodName}" has been claimed`,
    html: `<p>Hi ${donorName},</p><p><strong>${receiverName}</strong> has claimed your donation of <strong>${foodName}</strong>. Please keep it ready for pickup!</p>`
  }),
  donationExpiringSoon: (donorName, foodName, minutes) => ({
    subject: `⚠️ Donation expiring in ${minutes} minutes`,
    html: `<p>Hi ${donorName},</p><p>Your donation "<strong>${foodName}</strong>" will expire in approximately ${minutes} minutes and no one has claimed it yet. Please consider extending or disposing safely.</p>`
  }),
  claimConfirmed: (receiverName, foodName, address) => ({
    subject: `Claim confirmed — ${foodName}`,
    html: `<p>Hi ${receiverName},</p><p>Your claim for <strong>${foodName}</strong> is confirmed. Pickup from: <strong>${address}</strong>. Safe travels!</p>`
  }),
  collectionComplete: (donorName, receiverName, foodName) => ({
    subject: `✅ Food collected — ${foodName}`,
    html: `<p>Hi ${donorName},</p><p>Great news! <strong>${receiverName}</strong> has collected <strong>${foodName}</strong>. Thank you for your contribution to SDG 2 Zero Hunger!</p>`
  }),
  accountVerified: (name) => ({
    subject: '✅ Your FoodWatch account is verified',
    html: `<p>Hi ${name},</p><p>Your account has been verified by our admin team. You can now fully use the platform.</p>`
  })
};

module.exports = { sendEmail, emailTemplates };
