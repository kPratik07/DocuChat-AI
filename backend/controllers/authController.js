const User = require('../models/userModel');
const crypto = require('crypto');
const { generateToken } = require('../utils/jwtUtil');
const { sendVerificationEmail, sendPasswordResetOtp } = require('../services/emailService');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex');
const createToken = () => crypto.randomBytes(32).toString('hex');
const createOtp = () => crypto.randomInt(100000, 1000000).toString();

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  token: generateToken(user._id),
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const verificationToken = createToken();
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      emailVerificationTokenHash: tokenHash(verificationToken),
      emailVerificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      await User.deleteOne({ _id: user._id });
      console.error('Verification email error:', emailError);
      return res.status(503).json({ error: 'Account email could not be sent. Please try again later.' });
    }
    res.status(201).json({ message: 'Account created. Check your email to verify your account.' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to create your account right now.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user || !(await user.comparePassword(password || ''))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    if (user.emailVerified === false) {
      return res.status(403).json({ error: 'Please verify your email before signing in.' });
    }
    res.json(serializeUser(user));
  } catch (error) {
    res.status(500).json({ error: 'Unable to log in right now.' });
  }
};

const me = (req, res) => res.json({ id: req.user._id, name: req.user.name, email: req.user.email });

const verifyEmail = async (req, res) => {
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash(req.params.token),
    emailVerificationTokenExpires: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ error: 'This verification link is invalid or expired.' });

  user.emailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationTokenExpires = null;
  await user.save();
  res.json({
    ...serializeUser(user),
    message: 'Email verification successful.',
  });
};

const forgotPassword = async (req, res) => {
  const normalizedEmail = req.body.email?.trim().toLowerCase();
  const response = { message: 'If an account exists for that email, a reset code has been sent.' };
  if (!emailPattern.test(normalizedEmail || '')) return res.json(response);

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.json(response);

  const resetOtp = createOtp();
  user.passwordResetOtpHash = tokenHash(resetOtp);
  user.passwordResetOtpExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();
  await sendPasswordResetOtp(user, resetOtp);
  res.json(response);
};

const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (!emailPattern.test(email?.trim().toLowerCase() || '') || !/^\d{6}$/.test(otp || '')) {
    return res.status(400).json({ error: 'Please enter a valid email and six-digit OTP.' });
  }
  const user = await User.findOne({
    email: email.trim().toLowerCase(),
    passwordResetOtpHash: tokenHash(otp),
    passwordResetOtpExpires: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ error: 'This OTP is invalid or expired.' });

  user.password = password;
  user.emailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationTokenExpires = null;
  user.passwordResetOtpHash = null;
  user.passwordResetOtpExpires = null;
  await user.save();
  res.json({ message: 'Password reset successfully. You can now sign in.' });
};

module.exports = { register, login, me, verifyEmail, forgotPassword, resetPassword };
