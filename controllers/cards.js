const Card = require('../models/card');
const { writeTextToFile } = require('../errors/server-err-logs/error-logs');

const NotFoundError = require('../errors/not-found-err'); // 404
const BadRequesrError = require('../errors/bad-request-err'); // 400
const ClientError = require('../errors/client-err'); // 401
const InternalServerError = require('../errors/internal-server-err'); // 500

const date = Date.now();
const serverErrorFile = `../errors/server-err-logs/log-${date}.txt`;

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequesrError('Переданы некорректные данные при создании карточки.');
      } else {
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()};
        Текст ошибки: ${err.message}`);
        throw new InternalServerError('На сервере произошла ошибка.');
      }
    })
    .catch(next);
};
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`);
      throw new InternalServerError('На сервере произошла ошибка.');
    })
    .catch(next);
};
module.exports.deleteCard = (req, res, next) => {
  if (req.user._id === req.params.owner.id) {
    Card.findByIdAndRemove(req.params.cardId)
      .then((card) => {
        if (card == null) {
          throw new NotFoundError(`Передан несуществующий _id:${req.params.cardId} карточки.`);
        }
        res.send({ data: card });
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          throw new BadRequesrError(`Карточка с указанным _id:${req.params.cardId} не найдена.`);
        } else {
          writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`);
          throw new InternalServerError('На сервере произошла ошибка.');
        }
      })
      .catch(next);
  } else {
    throw new ClientError(`Это не Ваша карточка. Ай-яй-яй. Если она Вам не нравится, попросите пользователя: ${req.params.owner.id} удалить её =)`);
  }
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card == null) {
        throw new NotFoundError(`Передан несуществующий _id:${req.params.cardId} карточки.`);
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequesrError('Переданы некорректные данные для постановки/снятии лайка.');
      } else {
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`);
        throw new InternalServerError('На сервере произошла ошибка.');
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
      if (card == null) {
        throw new NotFoundError(`Передан несуществующий _id:${req.params.cardId} карточки.`);
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequesrError('Переданы некорректные данные для постановки/снятии лайка.');
      } else {
        writeTextToFile(serverErrorFile, `Дата и время ошибки: ${new Date()}; Текст ошибки: ${err.message}`);
        throw new InternalServerError('На сервере произошла ошибка.');
      }
    })
    .catch(next);
};
