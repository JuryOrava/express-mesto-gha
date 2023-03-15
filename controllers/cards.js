const Card = require('../models/card');

const NotFoundError = require('../errors/not-found-err'); // 404
const BadRequesrError = require('../errors/bad-request-err'); // 400
const ForbiddenError = require('../errors/forbidden-err'); // 403

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

function deleteValidCard(req, res, usetID, ownerID, next) {
  Card.findByIdAndRemove(req.params.cardId)
    .then((thisCard) => {
      res.send({ data: thisCard, masage: `юсер ид = ${typeof usetID}; овнер ид = ${typeof ownerID}` });
    })
    .catch(next);
}

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => {
      next(new NotFoundError(`Передан несуществующий _id:${req.params.cardId} карточки.`));
    })
    .then((card) => {
      if (req.user._id === card.owner._id) {
        deleteValidCard(req, res, req.user._id, card.owner._id, next);
      } else {
        next(new ForbiddenError(`Карточка с _id:${req.params.cardId} не Ваша. Ай-яй-яй.`));
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
    .orFail(() => {
      next(new NotFoundError(`Передан несуществующий _id:${req.params.cardId} карточки.`));
    })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequesrError('Переданы некорректные данные для постановки/снятии лайка.');
      }
    })
    .catch(next);
};
