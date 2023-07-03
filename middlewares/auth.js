const jwt = require('jsonwebtoken');
const NotAuthError = require('../errors/NotAuthError');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({message: "Not auth error"})
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
