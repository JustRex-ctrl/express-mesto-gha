const jwt = require('jsonwebtoken');
const NotAuthError = require('../errors/NotAuthError');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(NotAuthError).json({message: "Not authorized"})
}
  let payload;
  try {
    payload = jwt.verify(token, 'secret-key');
  } catch (err)
  {
    next(new NotAuthError('Invalid token'));
  }
  req.user = payload;
  next();
};
