const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');
const { uploadDirectory } = require('./config');
const { ApiError } = require('./errors');

const maxUploadBytes = 10 * 1024 * 1024;
const maxUserUploadBytes = 100 * 1024 * 1024;
const fileTypes = new Map([
  ['image/jpeg', { extension: '.jpg', signature: (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff }],
  ['image/png', { extension: '.png', signature: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) }],
  ['image/webp', { extension: '.webp', signature: (buffer) => buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' }],
  ['application/pdf', { extension: '.pdf', signature: (buffer) => buffer.subarray(0, 5).toString('ascii') === '%PDF-' }]
]);

function createUploadMiddleware(maxFileSize = maxUploadBytes) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSize, files: 1, fields: 0 }
  }).single('file');
}

function parseUpload(middleware, maxFileSize = maxUploadBytes) {
  return (req, res, next) => middleware(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(413, `File must be ${Math.floor(maxFileSize / 1024 / 1024)} MB or smaller.`));
      }
      return next(new ApiError(400, 'Upload one file at a time using the file field.'));
    }
    return next(error);
  });
}

function validateUploadedFile(file) {
  if (!file) {
    throw new ApiError(400, 'Choose an image or PDF file to upload.');
  }
  const type = fileTypes.get(file.mimetype);
  if (!type || !type.signature(file.buffer)) {
    throw new ApiError(400, 'File content must match a JPEG, PNG, WebP image, or PDF.');
  }
  return { mimeType: file.mimetype, extension: type.extension };
}

function storeUploadedFile(file, extension) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
  const storageKey = `${crypto.randomUUID()}${extension}`;
  fs.writeFileSync(path.join(uploadDirectory, storageKey), file.buffer, { flag: 'wx' });
  return storageKey;
}

function removeStoredFile(storageKey) {
  if (!/^[\da-f-]{36}\.(jpg|png|webp|pdf)$/i.test(storageKey)) {
    throw new Error('Invalid private upload key in database.');
  }
  fs.rmSync(path.join(uploadDirectory, storageKey), { force: true });
}

function uploadedFilePath(storageKey) {
  if (!/^[\da-f-]{36}\.(jpg|png|webp|pdf)$/i.test(storageKey)) {
    throw new Error('Invalid private upload key in database.');
  }
  return path.join(uploadDirectory, storageKey);
}

function safeOriginalName(originalName) {
  const baseName = path.basename(String(originalName).replace(/\\/g, '/'));
  return baseName.replace(/[^\w.-]/g, '_').slice(0, 120) || 'document';
}

module.exports = {
  maxUploadBytes,
  maxUserUploadBytes,
  createUploadMiddleware,
  parseUpload,
  validateUploadedFile,
  storeUploadedFile,
  removeStoredFile,
  uploadedFilePath,
  safeOriginalName
};
