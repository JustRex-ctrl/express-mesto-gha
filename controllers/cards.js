const cardSchema = require('../models/card');
const NotFoundError = require('../errors/NotFoundError'); //404
const ForbiddenError = require('../errors/ForbiddenError'); //403

const getCards = (req, res, next) => {
  cardSchema.find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch(next);
};

const postCard = (req, res, next) => {
  const { name, link } = req.body;
  cardSchema.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send(card))
    .catch(next);
};

const deleteCard = (req, res, next) => {
  cardSchema.findOne({ _id: req.params.cardId })
    .orFail(() => new NotFoundError('This card does not exist'))
    .then((card) => {
      const cardOwner = card.owner.toString();
      if (cardOwner !== req.user._id) {
        throw new ForbiddenError('Card deletion error');
      } else {
        const cardId = card._id.toString();
        cardSchema.deleteOne({ _id: cardId })
          .then((data) => res.send(data))
          .catch(next);
      }
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  cardSchema.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => new NotFoundError('Passed non-existent card _id'))
    .then((card) => res.send(card))
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  cardSchema.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => new NotFoundError('Passed non-existent card _id'))
    .then((card) => res.send(card))
    .catch(next);
};

module.exports = {
  getCards,
  postCard,
  deleteCard,
  likeCard,
  dislikeCard,
};