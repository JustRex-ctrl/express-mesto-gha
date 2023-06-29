const userSchema = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const MongoDuplicateKeyError = require('../errors/MongoDuplicateKeyError');
const NotFoundError = require('../errors/NotFoundError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

const getUsers = (req, res, next) => {
  userSchema
    .find({})
    .then((users) => res.status(200)
      .send(users))
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;

  userSchema
    .findById(userId)
    .orFail(new NotFoundError('non-existent user _id transferred'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Incorrect data passed during user creation'));
      }
      return next(err);
    });
};

const getUser = (req, res, next) => {
  userSchema
    .findById(req.user._id)
    .orFail(new NotFoundError('User is not found'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(BadRequestError('Incorrect data sent'));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  const { name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, saltRounds)
    .then((hash) => {
      userSchema
        .create({ name,
          about,
          avatar,
          email,
          password: hash,
        })
        .then(() => res.status(201)
          .send(
            { data: {
              name,
              about,
              avatar,
              email,
            },
            },
          ))
        .catch((err) => {
          if (err.code === 11000) {
            return next(new MongoDuplicateKeyError('User with this email already exists'));
          }
          if (err.name === 'ValidationError') {
            return next(new BadRequestError('Incorrect data passed during user creation'));
          }
          return next(err);
        });
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name,
          about,
        } = req.body;

  userSchema
    .findByIdAndUpdate(
      req.user._id,
      { name,
        about,
      },
      { new: true,
        runValidators: true,
      },
    )
    .orFail(new NotFoundError('non-existent user _id transferred'))
    .then((user) => res.status(200)
      .send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new BadRequestError('Invalid data passed when updating profile'));
      }
      return next(err);
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  userSchema
    .findByIdAndUpdate(
      req.user._id,
      { avatar },
      {new: true,
       runValidators: true,
      },
    )
    .orFail(new NotFoundError('User avatar by specified _id not found'))
    .then((user) => res.status(200)
      .send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new BadRequestError('Incorrect data passed when updating avatar'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return userSchema
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'JWT-secret', { expiresIn: '7d' });
      res.send({ token });
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
  getUser,
  createUser,
  updateUser,
  updateAvatar,
  login,
  getUserInfo
};
