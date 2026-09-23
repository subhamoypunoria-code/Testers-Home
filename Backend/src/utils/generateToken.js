const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in environment');
  process.exit(1);
}

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const generateRefreshToken = (id) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment');
  }
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' });
};

module.exports = { generateToken, generateRefreshToken };
