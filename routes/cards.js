const router = require('express').Router();
const { celebrate } = require('celebrate');

const {
  getCards,
  postCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const { cardSchema, cardIdSchema } = require('../middlewares/joi-schemas');

router.get('/', getCards);
router.post('/', celebrate({ body: cardSchema }), postCard);
router.delete('/:cardId', celebrate({ params: cardIdSchema }), deleteCard);
router.put('/:cardId/likes', celebrate({ params: cardIdSchema }), likeCard);
router.delete('/:cardId/likes', celebrate({ params: cardIdSchema }), dislikeCard);

module.exports = router;
