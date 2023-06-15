const userSchema = require('../models/user');
const {
  errInvalidData,
  errNotFound,
  errDefault
} = require('../utils/constants');

const getUsers = (req, res) => {
  userSchema.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(errDefault).send({ message: 'error on the server' }));
};

const getUserById = (req, res) => {
  userSchema.findById(req.params.userId)
    .then((user) => {
      if (!user) return res.status(errNotFound).send({ message: 'User _id was not found' });
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(errInvalidData).send({ message: 'Invalid user _id passed' });
      }
      return res.status(errDefault).send({ message: 'error on the server' });
    });
};

const postUser = (req, res) => {
  const { name, about, avatar } = req.body;
  userSchema.create({ name, about, avatar })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(errInvalidData).send({ message: 'Incorrect data passed during user creation' });
      }
      return res.status(errDefault).send({ message: 'error on the server' });
    });
};

const patchUser = (req, res) => {
  const { name, about } = req.body;
  userSchema.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) return res.status(errNotFound).send({ message: 'User id was not found' });
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(errInvalidData).send({ message: 'Incorrect data passed when updating user data' });
      }
      return res.status(errDefault).send({ message: 'error on the server' });
    });
};

const patchAvatar = (req, res) => {
  userSchema.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) return res.status(errNotFound).send({ message: 'User id was not found' });
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return res.status(errInvalidData).send({ message: 'Incorrect data passed when updating avatar' });
      }
      return res.status(errDefault).send({ message: 'error on the server' });
    });
};

module.exports = {
  getUsers,
  getUserById,
  postUser,
  patchUser,
  patchAvatar
};
