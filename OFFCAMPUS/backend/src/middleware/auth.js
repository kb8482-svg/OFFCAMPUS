const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const { ApiError } = require('../errors');

function authenticate(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Please sign in to continue.'));
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId) || userId < 1) {
      throw new Error('Invalid token subject.');
    }
    req.user = { id: userId, username: payload.username };
    return next();
  } catch {
    return next(new ApiError(401, 'Your session has expired. Please sign in again.'));
  }
}

module.exports = authenticate;
