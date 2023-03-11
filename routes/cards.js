const routerCard = require('express').Router()
const { createCard, getCards, deleteCard, likeCard, dislikeCard } = require('../controllers/cards.js')

routerCard.get('/cards', getCards)
routerCard.post('/cards', createCard)
routerCard.delete('/cards/:cardId', deleteCard)
routerCard.put('/cards/:cardId/likes', likeCard)
routerCard.delete('/cards/:cardId/likes', dislikeCard)

module.exports = routerCard
