const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ success: false, message: 'Valid email is required' });
    if (!password || password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const allowedRoles = ['tester', 'developer', 'manager', 'viewer'];
    const safeRole = role && allowedRoles.includes(role) ? role : 'tester';
    // Verification is optional for this demo environment; accounts are active immediately.
    const user = await User.create({ name, email, password, role: safeRole, isVerified: true });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.json({ success: true, token, refreshToken, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, avatar }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    if (!req.body.email || !EMAIL_RE.test(req.body.email)) return res.status(400).json({ success: false, message: 'Valid email is required' });
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'Email not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset',
        html: `<p>Reset your password: <a href="${process.env.CLIENT_URL}/reset-password/${token}">Reset</a></p>`,
      });
    } catch (_) { /* email optional */ }

    res.json({ success: true, message: 'Reset email sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    if (!req.body.password || req.body.password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    if (!req.body.currentPassword) return res.status(400).json({ success: false, message: 'Current password is required' });
    if (!req.body.newPassword || req.body.newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
