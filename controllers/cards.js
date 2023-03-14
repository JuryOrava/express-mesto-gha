const Card = require('../models/card');

const NotFoundError = require('../errors/not-found-err'); // 404
const BadRequesrError = require('../errors/bad-request-err'); // 400
// const ClientError = require('../errors/client-err'); // 401

module.exports.createCard = (req, res, next) => {
  const {
    name, link, email, password,
  } = req.body;

  Card.create({
    name, link, owner: req.user._id, email, password,
  })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequesrError('Переданы некорректные данные при создании карточки.');
      }
    })
    .catch(next);
};
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};
module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card == null) {
        next(new NotFoundError(`Передан несуществующий _id:${req.params.cardId} карточки.`));
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequesrError(`Карточка с указанным _id:${req.params.cardId} не найдена.`);
      }
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card == null) {
        next(new NotFoundError(`Передан несуществующий _id:${req.params.cardId} карточки.`));
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequesrError('Переданы некорректные данные для постановки/снятии лайка.');
      }
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === 'null') {
        next(new NotFoundError(`Передан несуществующий _id:${req.params.cardId} карточки.`));
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequesrError('Переданы некорректные данные для постановки/снятии лайка.');
      }
    })
    .catch(next);
};
