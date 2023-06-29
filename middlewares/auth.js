const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/NotAuthError');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, 'secret-key');
  } catch (err) {
    next(new UnauthorizedError('Invalid token'));
  }
  req.user = payload;
  next();
};
