const cardSchema = require('../models/card');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

const getCards = (req, res) => {
  cardSchema.find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch(() => res.status(BadRequestError).send({ message: 'error on the server' }));
};

const postCard = (req, res) => {
  const { name, link } = req.body;
  cardSchema.create({ name, link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ForbiddenError).send({ message: 'Incorrect data when creating card' });
      }
      return res.status(BadRequestError).send({ message: 'error on the server' });
    });
};

const deleteCard = (req, res) => {
  cardSchema.findByIdAndDelete({ _id: req.params.cardId })
    .then((card) => {
      if (!card) return res.status(NotFoundError).send({ message: 'non-existent cards _id transferred' });
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ForbiddenError).send({ message: 'non-existent cards _id transferred' });
      }
      return res.status(BadRequestError).send({ message: 'error on the server' });
    });
};

const likeCard = (req, res) => {
  cardSchema.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) return res.status(NotFoundError).send({ message: 'non-existent cards _id transferred' });
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ForbiddenError).send({ message: 'Incorrect data sent to like' });
      }
      return res.status(BadRequestError).send({ message: 'error on the server' });
    });
};

const dislikeCard = (req, res) => {
  cardSchema.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) return res.status(NotFoundError).send({ message: 'non-existent cards _id transferred' });
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(ForbiddenError).send({ message: 'Incorrect data sent to delete like' });
      }
      return res.status(BadRequestError).send({ message: 'error on the server' });
    });
};

module.exports = {
  getCards,
  postCard,
  deleteCard,
  likeCard,
  dislikeCard
};