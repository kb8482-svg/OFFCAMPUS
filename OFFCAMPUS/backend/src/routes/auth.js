const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { jwtSecret } = require('../config');
const { ApiError, asyncHandler } = require('../errors');

const router = express.Router();
const usernamePattern = /^[a-zA-Z0-9_.-]{3,32}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function issueToken(user) {
  return jwt.sign(
    { sub: String(user.id), username: user.username },
    jwtSecret,
    { expiresIn: '12h' }
  );
}

router.post('/register', asyncHandler(async (req, res) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!usernamePattern.test(username)) {
    throw new ApiError(400, 'Username must be 3–32 characters (letters, numbers, dot, dash or underscore).');
  }
  if (!emailPattern.test(email) || email.length > 254) {
    throw new ApiError(400, 'Enter a valid email address.');
  }
  if (password.length < 10 || password.length > 72) {
    throw new ApiError(400, 'Password must be between 10 and 72 characters.');
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE OR email = ?')
    .get(username, email);
  if (existing) {
    throw new ApiError(409, 'That username or email is already registered.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let result;
  try {
    result = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    ).run(username, email, passwordHash);
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed')) {
      throw new ApiError(409, 'That username or email is already registered.');
    }
    throw error;
  }

  const user = { id: Number(result.lastInsertRowid), username, email };
  res.status(201).json({ token: issueToken(user), user: { id: user.id, username, email } });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const identifier = typeof req.body.identifier === 'string' ? req.body.identifier.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!identifier || !password) {
    throw new ApiError(400, 'Enter your username or email and password.');
  }

  const user = db.prepare(`
    SELECT id, username, email, password_hash
    FROM users
    WHERE username = ? COLLATE NOCASE OR email = ?
  `).get(identifier, identifier.toLowerCase());

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new ApiError(401, 'The username/email or password is incorrect.');
  }

  res.json({
    token: issueToken(user),
    user: { id: user.id, username: user.username, email: user.email }
  });
}));

module.exports = router;
