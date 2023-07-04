const { Joi } = require('celebrate');
const isURL = require('validator/lib/isURL');
const BadRequestError = require('../errors/BadRequestError');

const validUrl = (url) => {
  if (isURL(url)) {
    return url;
  }
  throw new BadRequestError('Enter a valid link URL');
};

module.exports = {
  userIdSchema: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),

  userValidSchema: Joi.object().keys({
    email: Joi.string().email({ minDomainSegments: 2 }).required().min(5),
    password: Joi.string().required().min(3),
    name: Joi.string().optional().min(2).max(30),
    about: Joi.string().optional().min(2).max(30),
    avatar: Joi.string().custom(validUrl),
  }),

  userUpdateSchema: Joi.object().keys({
    name: Joi.string().optional().min(2).max(30),
    about: Joi.string().optional().min(2).max(30),
  }),

  avatarSchema: Joi.object().keys({
    avatar: Joi.string().custom(validUrl),
  }),

  loginSchema: Joi.object().keys({
    email: Joi.string().email({ minDomainSegments: 2 }).required().min(5),
    password: Joi.string().required().min(3),
  }),

  cardSchema: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(validUrl),
  }),

  cardIdSchema: Joi.object().keys({
    cardId: Joi.string().required().hex().length(24),
  }),
};
