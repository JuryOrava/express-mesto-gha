const Card = require('../models/card')

module.exports.createCard = (req, res) => {
  const { name, link } = req.body

  Card.create({ name, link, owner: req.user._id })
    .then(card => res.send({ data: card }))
    .then(card => console.log(card))
    // eslint-disable-next-line no-unused-vars
    .catch(err => res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' }))
    .catch(err => res.status(500).send({ message: err.message }))
}
module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then(cards => res.send({ data: cards }))
    .catch(err => res.status(500).send({ message: err.message }))
}
module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
  .then((card) => {
    // eslint-disable-next-line no-cond-assign
    if (card == null) {
      return res.status(404).send({ message: `Передан несуществующий _id:${req.params.cardId} карточки.` })
    }
    res.send({ data: card })
  })
    // eslint-disable-next-line no-unused-vars
    .catch(err => res.status(400).send({ message: `Карточка с указанным _id:${req.params.cardId} не найдена.` }))
    .catch(err => res.status(500).send({ message: err.message }))
}

// eslint-disable-next-line no-unused-vars
module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
  .then((card) => {
    // eslint-disable-next-line no-cond-assign
    if (card == null) {
      return res.status(404).send({ message: `Передан несуществующий _id:${req.params.cardId} карточки.` })
    }
    res.send({ data: card })
  })
  // eslint-disable-next-line no-unused-vars
  .catch(err => res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' }))
  .catch(err => res.status(500).send({ message: err.message }))
}

// eslint-disable-next-line no-unused-vars
module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
  .then((card) => {
    // eslint-disable-next-line no-cond-assign
    if (card == null) {
      return res.status(404).send({ message: `Передан несуществующий _id:${req.params.cardId} карточки.` })
    }
    res.send({ data: card })
  })
  // eslint-disable-next-line no-unused-vars
  .catch(err => res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' }))
  .catch(err => res.status(500).send({ message: err.message }))
}