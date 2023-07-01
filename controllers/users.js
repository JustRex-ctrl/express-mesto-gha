const userSchema = require('../models/user');
const NotAuthError = require('../errors/NotAuthError');
const NotFoundError = require('../errors/NotFoundError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsers = (req, res, next) => {
  userSchema.find({})
    .then((users) => res.send(users))
    .catch(next);
};

const getUserById = (req, res, next) => {
  userSchema.findById(req.params.userId)
    .orFail(() => new NotFoundError('User by specified _id not found'))
    .then((user) => res.status(200).send(user))
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      userSchema.create({
        name, about, avatar, email, password: hash,
      })
        .then((user) => res.status(201).send(user.deletePassword()))
        .catch(next);
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  userSchema.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },)
    .orFail(() => new NotFoundError('User by specified _id not found'))
    .then((user) => res.send(user))
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  userSchema.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    { new: true, runValidators: true },)
    .then((user) => res.send(user))
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  userSchema.findOne({ email })
    .select('+password')
    .orFail(() => new NotAuthError())
    .then((user) => {
      bcrypt.compare(String(password), user.password)
        .then((isUserValid) => {
          if (isUserValid) {
            const token = jwt.sign({ _id: user._id }, 'secret-key');
            res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true });
            res.send(user.deletePassword());
          } else {
            throw new NotAuthError();
          }
        })
        .catch(next);
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