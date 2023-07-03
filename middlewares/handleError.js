const BadRequestError = require('../errors/BadRequestError');
const MongoDuplicateKeyError = require('../errors/MongoDuplicateKeyError');
const ForbiddenError = require('../errors/ForbiddenError');
const InternalError = require('../errors/InternalError');
const NotFoundError = require('../errors/NotFoundError');
const NotAuthError = require('../errors/NotAuthError');

function handleError(err, req, res, next) {
  function setError() {
    if (err.code === 11000) {
      return new MongoDuplicateKeyError('This email is already use');
    }
    if (err.errors?.email) {
      return new BadRequestError(`${err.errors.email.value} Wrong email address`);
    }
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      return new BadRequestError();
    }
    if (
      err instanceof NotFoundError
      || err instanceof NotAuthError
      || err instanceof BadRequestError
      || err instanceof ForbiddenError
    ) {
      return err;
    }

    return new InternalError();
  }
  const error = setError();

  res.status(error.statusCode).send({ message: error.message, err });
  next();
}

module.exports = handleError;
