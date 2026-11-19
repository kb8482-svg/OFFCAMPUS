require('dotenv').config();

const crypto = require('node:crypto');
const path = require('node:path');

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production.');
}

const jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const allowedOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = {
  jwtSecret,
  port: Number(process.env.PORT) || 3000,
  frontendPort: Number(process.env.FRONTEND_PORT) || 5173,
  allowedOrigins,
  uploadDirectory: process.env.UPLOAD_DIRECTORY
    ? path.resolve(process.env.UPLOAD_DIRECTORY)
    : path.join(__dirname, '..', 'data', 'private-uploads')
};
