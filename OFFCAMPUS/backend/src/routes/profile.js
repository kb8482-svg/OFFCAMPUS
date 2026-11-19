const express = require('express');
const { db } = require('../db');
const { ApiError } = require('../errors');
const {
  createUploadMiddleware,
  parseUpload,
  validateUploadedFile,
  storeUploadedFile,
  maxUserUploadBytes,
  removeStoredFile,
  uploadedFilePath
} = require('../uploads');

const router = express.Router();
const maxAvatarBytes = 5 * 1024 * 1024;
const avatarUpload = parseUpload(createUploadMiddleware(maxAvatarBytes), maxAvatarBytes);

router.get('/', (req, res) => {
  const user = db.prepare(`
    SELECT username, email, display_name, avatar_key
    FROM users WHERE id = ?
  `).get(req.user.id);
  if (!user) throw new ApiError(404, 'Profile not found.');
  res.json({
    username: user.username,
    email: user.email,
    displayName: user.display_name || user.username,
    hasAvatar: Boolean(user.avatar_key)
  });
});

router.patch('/', (req, res) => {
  const displayName = typeof req.body.displayName === 'string' ? req.body.displayName.trim() : '';
  if (!displayName || displayName.length > 80) {
    throw new ApiError(400, 'Display name is required and must be 80 characters or fewer.');
  }
  db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(displayName, req.user.id);
  res.json({ displayName });
});

router.get('/avatar', (req, res, next) => {
  const user = db.prepare('SELECT avatar_key FROM users WHERE id = ?').get(req.user.id);
  if (!user || !user.avatar_key) throw new ApiError(404, 'No profile picture is set.');
  const filePath = uploadedFilePath(user.avatar_key);
  res.sendFile(filePath, {
    headers: {
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff'
    }
  }, (error) => {
    if (error) next(error);
  });
});

router.put('/avatar', avatarUpload, (req, res) => {
  const { mimeType, extension } = validateUploadedFile(req.file);
  if (mimeType === 'application/pdf') {
    throw new ApiError(400, 'Profile pictures must be JPEG, PNG, or WebP images.');
  }
  const user = db.prepare('SELECT avatar_key, avatar_size FROM users WHERE id = ?').get(req.user.id);
  if (!user) throw new ApiError(404, 'Profile not found.');
  const usage = db.prepare(`
    SELECT avatar_size + COALESCE((
      SELECT SUM(size_bytes) FROM expense_receipts WHERE user_id = ?
    ), 0) AS total
    FROM users WHERE id = ?
  `).get(req.user.id, req.user.id);
  if (usage.total - user.avatar_size + req.file.size > maxUserUploadBytes) {
    throw new ApiError(413, 'Your private file storage is full. Remove an old file before uploading another.');
  }
  const storageKey = storeUploadedFile(req.file, extension);
  try {
    db.prepare('UPDATE users SET avatar_key = ?, avatar_size = ? WHERE id = ?')
      .run(storageKey, req.file.size, req.user.id);
  } catch (error) {
    removeStoredFile(storageKey);
    throw error;
  }
  if (user.avatar_key) removeStoredFile(user.avatar_key);
  res.status(201).json({ hasAvatar: true });
});

router.delete('/avatar', (req, res) => {
  const user = db.prepare('SELECT avatar_key FROM users WHERE id = ?').get(req.user.id);
  if (!user) throw new ApiError(404, 'Profile not found.');
  db.prepare('UPDATE users SET avatar_key = NULL, avatar_size = 0 WHERE id = ?').run(req.user.id);
  if (user.avatar_key) removeStoredFile(user.avatar_key);
  res.status(204).end();
});

module.exports = router;
