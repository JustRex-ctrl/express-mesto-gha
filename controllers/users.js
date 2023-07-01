const userSchema = require('../models/user');
const NotAuthError = require('../errors/NotAuthError'); //401
const NotFoundError = require('../errors/NotFoundError'); //404
const MongoDuplicateKeyError = require('../errors/MongoDuplicateKeyError')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsers = (req, res, next) => {
  userSchema.find({})
    .then((users) => res.send(users))
    .catch(next);
};

const getUserById = (req, res, next) => {
  let userId;

  if (req.params.id) {
    userId = req.params.id;
  } else {
    userId = req.user._id;
  }

  console.log(userId);

  userSchema
    .findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new NotFoundError('Invalid data when get user'));
      }

      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFoundError(`User Id: ${userId} is not found`));
      }

      return next(res);
    });
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => userSchema.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      res.status(201).send(userObj);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new MongoDuplicateKeyError('A user with such a email is already registered'));
      }

      if (err.name === 'ValidationError') {
        return next(new NotFoundError('Invalid data when post user'));
      }

      return next(err);
    });
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  userSchema.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new NotFoundError('Invalid user id passed'));
      }

      return next(err);
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  userSchema.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new NotFoundError('Invalid user id passed'));
      }

      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFoundError(`User Id: ${req.user._id} is not found`));
      }

      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return userSchema
    .findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return next(new NotAuthError('incorrect email or password'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return next(new NotAuthError('incorrect email or password'));
          }

          const token = jwt.sign({ _id: user._id }, 'secret-person-key', { expiresIn: '7d' });
          res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true, sameSite: true });

          return res.status(200).send({ token });
        });
    })
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  userSchema.findOne({ _id: req.user })
    .then((user) => res.send(user))
    .catch(next);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateAvatar,
  login,
  getUserInfo,
};