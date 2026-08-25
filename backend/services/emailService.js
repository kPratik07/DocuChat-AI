const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP email configuration is missing.');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = ({ to, subject, text }) =>
  getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

const sendVerificationEmail = (user, token) => sendEmail({
  to: user.email,
  subject: 'Verify your DocuChat AI email',
  text: `Hi ${user.name},\n\nVerify your DocuChat AI email by opening this link:\n${frontendUrl()}/?verifyToken=${token}\n\nThis link expires in 24 hours.`,
});

const sendPasswordResetOtp = (user, otp) => sendEmail({
  to: user.email,
  subject: 'Your DocuChat AI password reset code',
  text: `Hi ${user.name},\n\nYour DocuChat AI password reset OTP is: ${otp}\n\nThis code expires in 1 hour. If you did not request this, you can ignore this email.`,
});

module.exports = { sendVerificationEmail, sendPasswordResetOtp };