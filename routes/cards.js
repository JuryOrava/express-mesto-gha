const routerCard = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  createCard, getCards, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

routerCard.get('/cards', getCards);
routerCard.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().regex(/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}(?:[-a-zA-Z0-9()@:%_.~#?&=]*)/),
  }),
}), createCard);
routerCard.delete('/cards/:cardId', deleteCard);
routerCard.put('/cards/:cardId/likes', likeCard);
routerCard.delete('/cards/:cardId/likes', dislikeCard);

module.exports = routerCard;
