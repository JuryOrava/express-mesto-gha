const Card = require('../models/card')
const { writeTextToFile } = require('./server-err-logs/error-logs')

const date = Date.now();
const serverErrorFile = `./controllers/server-err-logs/log-${date}.txt`

const ERROR_CODE = 404;
const CAST_ERROR_CODE = 400;

module.exports.createCard = (req, res) => {
  const { name, link } = req.body

  Card.create({ name, link, owner: req.user._id })
    .then(card => res.send({ data: card }))
    .catch(err => {
      if (err.name == 'CastError') {
        res.status(CAST_ERROR_CODE).send({ message: `Переданы некорректные данные при создании карточки.` })
      } else {
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`)
      }
    })
}
module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then(cards => res.send({ data: cards}))
    .catch(err => {
      if (err.name == 'CastError') {
        res.status(CAST_ERROR_CODE).send({ message: `Что-то пошло не так.` })
      } else {
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`)
      }
    })
}
module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
  .then((card) => {
    if (card == null) {
      return res.status(ERROR_CODE).send({ message: `Передан несуществующий _id:${req.params.cardId} карточки.` })
    }
    res.send({ data: card })
  })
    .catch(err => {
      if (err.name == 'CastError') {
        res.status(CAST_ERROR_CODE).send({ message: `Карточка с указанным _id:${req.params.cardId} не найдена.` })
      } else {
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`)
      }
    })
}

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
  .then((card) => {
    if (card == null) {
      return res.status(ERROR_CODE).send({ message: `Передан несуществующий _id:${req.params.cardId} карточки.` })
    }
    res.send({ data: card })
  })
  .catch(err => {
    if (err.name == 'CastError') {
      res.status(CAST_ERROR_CODE).send({ message: `Переданы некорректные данные для постановки/снятии лайка.` })
    } else {
      writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`)
    }
  })
}

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
  .then((card) => {
    if (card == null) {
      return res.status(ERROR_CODE).send({ message: `Передан несуществующий _id:${req.params.cardId} карточки.` })
    }
    res.send({ data: card })
  })
  .catch(err => {
    if (err.name == 'CastError') {
      res.status(CAST_ERROR_CODE).send({ message: `Переданы некорректные данные для постановки/снятии лайка.` })
    } else {
      writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`)
    }
  })
}