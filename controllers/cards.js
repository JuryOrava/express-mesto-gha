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
        return next(new BadRequesrError('Переданы некорректные данные при создании карточки.'));
      }
      next(new Error());
    });
};
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

function deleteValidCard(req, res, next) {
  Card.findByIdAndRemove(req.params.cardId)
    .then((thisCard) => {
      res.send({ data: thisCard });
    })
    .catch(next);
}

module.exports.deleteCard = (req, res, next) => {
  const userId = { userId: req.user._id };
  Card.findById(req.params.cardId)
    .orFail(() => {
      next(new NotFoundError(`Передан несуществующий _id:${req.params.cardId} карточки.`));
    })
    .then((card) => {
      if (userId.userId === card.owner._id.toString()) {
        deleteValidCard(req, res, next);
      } else {
        next(new ForbiddenError(`Карточка с _id:${req.params.cardId} не Ваша. Ай-яй-яй.`));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequesrError(`Карточка с указанным _id:${req.params.cardId} не найдена.`));
      }
      next(new Error());
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card == null) {
        return next(new NotFoundError(`Передан несуществующий _id:${req.params.cardId} карточки.`));
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequesrError('Переданы некорректные данные для постановки/снятии лайка.'));
      }
      next(new Error());
    });
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
        return next(new BadRequesrError('Переданы некорректные данные для постановки/снятии лайка.'));
      }
      next(new Error());
    });
};
